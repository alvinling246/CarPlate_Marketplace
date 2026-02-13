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

            var entity = new Plate
            {
                PlateNumber = normalizedNumber,
                Price = plate.Price,
                IsSold = plate.IsSold,
                Category = plate.Category,
                AddedDate = DateTime.Now
            };
            _context.Plates.Add(entity);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPlate), new { id = entity.Id }, entity);
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

        // PATCH: api/Plates/5/sold
        [HttpPatch("{id}/sold")]
        public async Task<IActionResult> MarkAsSold(int id)
        {
            var plate = await _context.Plates.FindAsync(id);
            if (plate == null) return NotFound();
            plate.IsSold = true;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
