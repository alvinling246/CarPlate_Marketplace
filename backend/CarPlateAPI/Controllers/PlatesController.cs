using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.EntityFrameworkCore;
using CarPlateAPI.Data;
using CarPlateAPI.Models;

namespace CarPlateAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowReactApp")]
    public class PlatesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PlatesController(AppDbContext context)
        {
            _context = context;
        }

        private static PlateDto ToDto(Plate p, Reservation? res, Sale? sale, Buyer? resBuyer, Buyer? saleBuyer)
        {
            var dto = new PlateDto
            {
                Id = p.Id,
                PlateNumber = p.PlateNumber ?? "",
                Price = p.Price,
                Status = p.Status ?? "Available",
                BuyerId = p.BuyerId,
                Category = p.Category,
                AddedDate = p.AddedDate,
            };
            if (p.Status == "Reserved" && res != null && resBuyer != null)
            {
                dto.ReservedDate = res.ReservedDate.Date;
                dto.SoldReservedBy = resBuyer.FullName ?? resBuyer.Dealer?.FullName;
                dto.ContactNumber = resBuyer.PhoneNumber ?? resBuyer.Dealer?.PhoneNumber;
                dto.Email = resBuyer.Email ?? resBuyer.Dealer?.Email;
            }
            if (p.Status == "Sold" && sale != null && saleBuyer != null)
            {
                dto.SoldDate = sale.SoldDate.Date;
                dto.SoldReservedBy = saleBuyer.FullName ?? saleBuyer.Dealer?.FullName;
                dto.ContactNumber = saleBuyer.PhoneNumber ?? saleBuyer.Dealer?.PhoneNumber;
                dto.Email = saleBuyer.Email ?? saleBuyer.Dealer?.Email;
            }
            return dto;
        }

        private async Task<(List<Reservation> resList, List<Sale> saleList, Dictionary<int, Buyer> buyers)> LoadReservationsAndSales(IEnumerable<int> plateIds)
        {
            var pidList = plateIds.Distinct().ToList();
            if (pidList.Count == 0)
                return (new List<Reservation>(), new List<Sale>(), new Dictionary<int, Buyer>());

            var resList = await _context.Reservations
                .Where(r => pidList.Contains(r.PlateNoId) && r.Status == "Active")
                .OrderByDescending(r => r.Id)
                .ToListAsync();
            var saleList = await _context.Sales
                .Where(s => pidList.Contains(s.PlateNoId))
                .OrderByDescending(s => s.Id)
                .ToListAsync();

            var buyerIds = resList.Select(r => r.BuyerId).Union(saleList.Select(s => s.BuyerId)).Distinct().ToList();
            var buyers = await _context.Buyers
                .Include(b => b.Dealer)
                .Where(b => buyerIds.Contains(b.Id))
                .ToDictionaryAsync(b => b.Id, b => b);

            return (resList, saleList, buyers);
        }

        // GET: api/Plates
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PlateDto>>> GetPlates(
            [FromQuery] string? search = null,
            [FromQuery] string? category = null)
        {
            var query = _context.Plates.AsQueryable();

            if (!string.IsNullOrEmpty(category) && category != "All Carplates")
                query = query.Where(p => p.Category == category);
            if (!string.IsNullOrEmpty(search))
                query = query.Where(p => p.PlateNumber != null && p.PlateNumber.Contains(search));

            var plates = await query.OrderByDescending(p => p.AddedDate).ToListAsync();
            var plateIds = plates.Select(p => p.Id).ToList();
            var (resList, saleList, buyers) = await LoadReservationsAndSales(plateIds);

            var latestResByPlate = resList.GroupBy(r => r.PlateNoId).ToDictionary(g => g.Key, g => g.First());
            var latestSaleByPlate = saleList.GroupBy(s => s.PlateNoId).ToDictionary(g => g.Key, g => g.First());

            var result = plates.Select(p =>
            {
                latestResByPlate.TryGetValue(p.Id, out var res);
                latestSaleByPlate.TryGetValue(p.Id, out var sale);
                buyers.TryGetValue(res?.BuyerId ?? 0, out var resBuyer);
                buyers.TryGetValue(sale?.BuyerId ?? 0, out var saleBuyer);
                return ToDto(p, res, sale, resBuyer, saleBuyer);
            }).ToList();

            return result;
        }

        // GET: api/Plates/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PlateDto>> GetPlate(int id)
        {
            var plate = await _context.Plates.FindAsync(id);
            if (plate == null) return NotFound();

            var (resList, saleList, buyers) = await LoadReservationsAndSales(new[] { id });
            var res = resList.FirstOrDefault(r => r.PlateNoId == id);
            var sale = saleList.FirstOrDefault(s => s.PlateNoId == id);
            buyers.TryGetValue(res?.BuyerId ?? 0, out var resBuyer);
            buyers.TryGetValue(sale?.BuyerId ?? 0, out var saleBuyer);

            return ToDto(plate, res, sale, resBuyer, saleBuyer);
        }

        // POST: api/Plates
        [HttpPost]
        public async Task<ActionResult<PlateDto>> PostPlate(Plate plate)
        {
            var normalizedNumber = (plate.PlateNumber ?? string.Empty).Trim().ToUpperInvariant();
            if (string.IsNullOrWhiteSpace(normalizedNumber))
                return BadRequest(new { message = "Plate number is required." });

            var existingNumbers = await _context.Plates.Select(p => p.PlateNumber ?? "").ToListAsync();
            if (existingNumbers.Any(n => n.Trim().ToUpperInvariant() == normalizedNumber))
                return BadRequest(new { message = "This plate number already exists. Plate numbers must be unique." });

            var status = !string.IsNullOrWhiteSpace(plate.Status) ? plate.Status.Trim() : "Available";
            if (status != "Available" && status != "Reserved" && status != "Sold")
                status = "Available";

            var entity = new Plate
            {
                PlateNumber = normalizedNumber,
                Price = plate.Price,
                Status = status,
                Category = plate.Category,
                BuyerId = plate.BuyerId,
                AddedDate = DateTime.Now,
            };
            _context.Plates.Add(entity);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPlate), new { id = entity.Id }, ToDto(entity, null, null, null, null));
        }

        // PATCH: api/Plates/5
        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdatePlate(int id, [FromBody] UpdatePlateRequest? body)
        {
            var plate = await _context.Plates.FindAsync(id);
            if (plate == null) return NotFound();
            if (body == null) return NoContent();

            if (body.PlateNumber != null)
            {
                var normalizedNumber = body.PlateNumber.Trim().ToUpperInvariant();
                if (string.IsNullOrWhiteSpace(normalizedNumber))
                    return BadRequest(new { message = "Plate number is required." });
                var existingNumbers = await _context.Plates.Where(p => p.Id != id).Select(p => p.PlateNumber ?? "").ToListAsync();
                if (existingNumbers.Any(n => n.Trim().ToUpperInvariant() == normalizedNumber))
                    return BadRequest(new { message = "This plate number already exists. Plate numbers must be unique." });
                plate.PlateNumber = normalizedNumber;
            }
            if (body.Category != null)
                plate.Category = string.IsNullOrWhiteSpace(body.Category) ? null : body.Category.Trim();
            if (body.Price.HasValue)
                plate.Price = body.Price.Value;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PATCH: api/Plates/5/price
        [HttpPatch("{id}/price")]
        public async Task<IActionResult> UpdatePrice(int id, [FromBody] decimal price)
        {
            var plate = await _context.Plates.FindAsync(id);
            if (plate == null) return NotFound();
            plate.Price = price;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private async Task<Buyer> GetOrCreateBuyer(int? dealerId, string fullName, string phoneNumber, string? email)
        {
            if (dealerId.HasValue)
            {
                var existing = await _context.Buyers
                    .Include(b => b.Dealer)
                    .FirstOrDefaultAsync(b => b.DealerId == dealerId.Value);
                if (existing != null) return existing;
                var buyer = new Buyer
                {
                    DealerId = dealerId,
                    FullName = null,
                    PhoneNumber = null,
                    Email = null,
                };
                _context.Buyers.Add(buyer);
                await _context.SaveChangesAsync();
                return buyer;
            }

            var name = (fullName ?? "").Trim();
            var phone = (phoneNumber ?? "").Trim();
            if (string.IsNullOrWhiteSpace(name)) name = "Unknown";

            var existingOther = await _context.Buyers
                .Include(b => b.Dealer)
                .FirstOrDefaultAsync(b => b.DealerId == null && b.FullName == name && b.PhoneNumber == phone);
            if (existingOther != null) return existingOther;

            var newBuyer = new Buyer
            {
                DealerId = null,
                FullName = name,
                PhoneNumber = phone,
                Email = string.IsNullOrWhiteSpace(email) ? null : email.Trim(),
            };
            _context.Buyers.Add(newBuyer);
            await _context.SaveChangesAsync();
            return newBuyer;
        }

        // PATCH: api/Plates/5/reserve
        [HttpPatch("{id}/reserve")]
        public async Task<IActionResult> MarkAsReserved(int id, [FromBody] MarkReserveRequest? body = null)
        {
            var plate = await _context.Plates.FindAsync(id);
            if (plate == null) return NotFound();

            var byWho = (body?.SoldReservedBy ?? "").Trim();
            var contact = (body?.ContactNumber ?? "").Trim();
            var email = (body?.Email ?? "").Trim();
            if ((body?.DealerId ?? 0) == 0 && string.IsNullOrWhiteSpace(byWho) && string.IsNullOrWhiteSpace(contact))
                return BadRequest(new { message = "SoldReservedBy or ContactNumber is required, or select a registered dealer." });

            var buyer = await GetOrCreateBuyer(body?.DealerId, byWho, contact, email);
            var reservedDate = body?.ReservedDate?.Date ?? DateTime.Now.Date;

            var reservation = new Reservation
            {
                PlateNoId = id,
                BuyerId = buyer.Id,
                ReservedDate = reservedDate,
                Status = "Active",
            };
            _context.Reservations.Add(reservation);
            plate.Status = "Reserved";
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PATCH: api/Plates/5/available
        [HttpPatch("{id}/available")]
        public async Task<IActionResult> MarkAsAvailable(int id)
        {
            var plate = await _context.Plates.FindAsync(id);
            if (plate == null) return NotFound();

            var activeRes = await _context.Reservations
                .Where(r => r.PlateNoId == id && r.Status == "Active")
                .OrderByDescending(r => r.Id)
                .FirstOrDefaultAsync();
            if (activeRes != null)
                activeRes.Status = "Cancelled";
            plate.Status = "Available";
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PATCH: api/Plates/5/sold
        [HttpPatch("{id}/sold")]
        public async Task<IActionResult> MarkAsSold(int id, [FromBody] MarkSoldRequest? body = null)
        {
            var plate = await _context.Plates.FindAsync(id);
            if (plate == null) return NotFound();

            int? reservationId = null;
            var activeRes = await _context.Reservations
                .Where(r => r.PlateNoId == id && r.Status == "Active")
                .OrderByDescending(r => r.Id)
                .FirstOrDefaultAsync();
            if (activeRes != null)
            {
                reservationId = activeRes.Id;
                activeRes.Status = "Converted to Sale";
                await _context.SaveChangesAsync();
            }

            Buyer buyer;
            if (plate.Status == "Reserved" && activeRes != null)
            {
                buyer = await _context.Buyers.FindAsync(activeRes.BuyerId) ?? throw new InvalidOperationException("Buyer not found.");
            }
            else
            {
                var byWho = (body?.SoldReservedBy ?? "").Trim();
                var contact = (body?.ContactNumber ?? "").Trim();
                var email = (body?.Email ?? "").Trim();
                if ((body?.DealerId ?? 0) == 0 && string.IsNullOrWhiteSpace(byWho) && string.IsNullOrWhiteSpace(contact))
                    return BadRequest(new { message = "SoldReservedBy or ContactNumber is required, or select a registered dealer." });
                buyer = await GetOrCreateBuyer(body?.DealerId, byWho, contact, email);
            }

            var soldDate = body?.SoldDate?.Date ?? DateTime.Now.Date;
            var sale = new Sale
            {
                PlateNoId = id,
                BuyerId = buyer.Id,
                ReservationId = reservationId,
                SoldDate = soldDate,
                SoldPrice = plate.Price,
            };
            _context.Sales.Add(sale);
            plate.Status = "Sold";
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/Plates/5
        [HttpDelete("{id}")]
        [HttpPost("{id}/delete")]
        public async Task<IActionResult> DeletePlate(int id)
        {
            var plate = await _context.Plates.FindAsync(id);
            if (plate == null) return NotFound();
            var reservations = await _context.Reservations.Where(r => r.PlateNoId == id).ToListAsync();
            var sales = await _context.Sales.Where(s => s.PlateNoId == id).ToListAsync();
            _context.Reservations.RemoveRange(reservations);
            _context.Sales.RemoveRange(sales);
            _context.Plates.Remove(plate);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
