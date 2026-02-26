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

        // GET: api/Plates
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Plate>>> GetPlates(
            [FromQuery] string? search = null,
            [FromQuery] string? category = null)
        {
            var query = _context.Plates.AsQueryable();

            if (!string.IsNullOrEmpty(category) && category != "All Carplates")
            {
                query = query.Where(p => p.Category == category);
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => p.PlateNumber.Contains(search));
            }

            return await query.OrderByDescending(p => p.AddedDate).ToListAsync();
        }

        // GET: api/Plates/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Plate>> GetPlate(int id)
        {
            var plate = await _context.Plates.FindAsync(id);
            if (plate == null) return NotFound();
            return plate;
        }

        // POST: api/Plates
        [HttpPost]
        public async Task<ActionResult<Plate>> PostPlate(Plate plate)
        {
            var normalizedNumber = (plate.PlateNumber ?? string.Empty).Trim().ToUpperInvariant();
            if (string.IsNullOrWhiteSpace(normalizedNumber))
            {
                return BadRequest(new { message = "Plate number is required." });
            }

            // Check duplicate in memory so LINQ stays translatable; fine for small tables
            var existingNumbers = await _context.Plates.Select(p => p.PlateNumber ?? "").ToListAsync();
            bool exists = existingNumbers.Any(n => n.Trim().ToUpperInvariant() == normalizedNumber);

            if (exists)
            {
                return BadRequest(new { message = "This plate number already exists. Plate numbers must be unique." });
            }

            var status = !string.IsNullOrWhiteSpace(plate.Status) ? plate.Status.Trim() : "Available";
            if (status != "Available" && status != "Reserved" && status != "Sold")
                status = "Available";

            var entity = new Plate
            {
                PlateNumber = normalizedNumber,
                Price = plate.Price,
                Status = status,
                Category = plate.Category,
                AddedDate = DateTime.Now,
                SoldReservedBy = plate.SoldReservedBy,
                ReservedDate = plate.ReservedDate,
                SoldDate = plate.SoldDate,
                ContactNumber = plate.ContactNumber,
                Email = plate.Email
            };
            _context.Plates.Add(entity);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPlate), new { id = entity.Id }, entity);
        }

        // PATCH: api/Plates/5 - update plate number, category, and/or price
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

        // PATCH: api/Plates/5/reserve
        [HttpPatch("{id}/reserve")]
        public async Task<IActionResult> MarkAsReserved(int id, [FromBody] MarkReserveRequest? body = null)
        {
            var plate = await _context.Plates.FindAsync(id);
            if (plate == null) return NotFound();
            plate.Status = "Reserved";
            if (body?.ReservedDate.HasValue == true)
                plate.ReservedDate = body.ReservedDate.Value.Date;
            if (!string.IsNullOrWhiteSpace(body?.SoldReservedBy))
                plate.SoldReservedBy = body.SoldReservedBy.Trim();
            if (body?.ContactNumber != null)
                plate.ContactNumber = string.IsNullOrWhiteSpace(body.ContactNumber) ? null : body.ContactNumber.Trim();
            if (body?.Email != null)
                plate.Email = string.IsNullOrWhiteSpace(body.Email) ? null : body.Email.Trim();
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PATCH: api/Plates/5/available (clear reserved state)
        [HttpPatch("{id}/available")]
        public async Task<IActionResult> MarkAsAvailable(int id)
        {
            var plate = await _context.Plates.FindAsync(id);
            if (plate == null) return NotFound();
            plate.Status = "Available";
            plate.ReservedDate = null;
            plate.SoldReservedBy = null;
            plate.ContactNumber = null;
            plate.Email = null;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PATCH: api/Plates/5/sold
        [HttpPatch("{id}/sold")]
        public async Task<IActionResult> MarkAsSold(int id, [FromBody] MarkSoldRequest? body = null)
        {
            var plate = await _context.Plates.FindAsync(id);
            if (plate == null) return NotFound();
            plate.Status = "Sold";
            plate.SoldDate = (body?.SoldDate.HasValue == true) ? body.SoldDate.Value.Date : DateTime.Now.Date;
            if (!string.IsNullOrWhiteSpace(body?.SoldReservedBy))
                plate.SoldReservedBy = body.SoldReservedBy.Trim();
            if (body?.ContactNumber != null)
                plate.ContactNumber = string.IsNullOrWhiteSpace(body.ContactNumber) ? null : body.ContactNumber.Trim();
            if (body?.Email != null)
                plate.Email = string.IsNullOrWhiteSpace(body.Email) ? null : body.Email.Trim();
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/Plates/5
        [HttpDelete("{id}")]
        // POST: api/Plates/5/delete (fallback when DELETE is not allowed by proxy/firewall)
        [HttpPost("{id}/delete")]
        public async Task<IActionResult> DeletePlate(int id)
        {
            var plate = await _context.Plates.FindAsync(id);
            if (plate == null) return NotFound();
            _context.Plates.Remove(plate);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
