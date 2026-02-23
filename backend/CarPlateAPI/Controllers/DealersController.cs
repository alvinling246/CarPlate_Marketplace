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
    public class DealersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DealersController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/Dealers/login
        [HttpPost("login")]
        public async Task<ActionResult<object>> Login([FromBody] DealerLoginRequest request)
        {
            var username = request?.Username?.Trim() ?? "";
            var password = request?.Password ?? "";

            if (string.IsNullOrEmpty(username))
                return BadRequest(new { message = "Username is required." });
            if (string.IsNullOrEmpty(password))
                return BadRequest(new { message = "Password is required." });

            // Case-insensitive username lookup (DB may have different casing)
            var dealer = await _context.Dealers
                .FirstOrDefaultAsync(d => d.Username != null && d.Username.ToLower() == username.ToLower());
            if (dealer == null)
                return Unauthorized(new { message = "Invalid username or password." });
            if (!dealer.IsActive)
                return Unauthorized(new { message = "This dealer account is inactive." });
            // Compare password (trim both to avoid whitespace issues)
            var storedPassword = dealer.Password?.Trim() ?? "";
            if (storedPassword != password.Trim())
                return Unauthorized(new { message = "Invalid username or password." });

            dealer.LastLoginDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { id = dealer.Id, username = dealer.Username, fullName = dealer.FullName });
        }

        // GET: api/Dealers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Dealer>>> GetDealers()
        {
            return await _context.Dealers
                .OrderByDescending(d => d.CreatedDate)
                .ToListAsync();
        }

        // GET: api/Dealers/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Dealer>> GetDealer(int id)
        {
            var dealer = await _context.Dealers.FindAsync(id);
            if (dealer == null) return NotFound();
            return dealer;
        }

        // POST: api/Dealers
        [HttpPost]
        public async Task<ActionResult<Dealer>> PostDealer(Dealer dealer)
        {
            if (string.IsNullOrWhiteSpace(dealer.FullName))
                return BadRequest(new { message = "Full name is required." });
            if (string.IsNullOrWhiteSpace(dealer.PhoneNumber))
                return BadRequest(new { message = "Phone number is required." });
            if (string.IsNullOrWhiteSpace(dealer.Email))
                return BadRequest(new { message = "Email is required." });
            if (string.IsNullOrWhiteSpace(dealer.Username))
                return BadRequest(new { message = "Username is required." });
            if (string.IsNullOrWhiteSpace(dealer.Password))
                return BadRequest(new { message = "Password is required." });

            var usernameNorm = (dealer.Username ?? "").Trim();
            var exists = await _context.Dealers.AnyAsync(d => d.Username == usernameNorm);
            if (exists)
                return BadRequest(new { message = "A dealer with this username already exists." });

            var entity = new Dealer
            {
                FullName = (dealer.FullName ?? "").Trim(),
                PhoneNumber = (dealer.PhoneNumber ?? "").Trim(),
                Email = (dealer.Email ?? "").Trim(),
                Username = usernameNorm,
                Password = dealer.Password,
                IsActive = true,
                CreatedDate = DateTime.Now
            };
            _context.Dealers.Add(entity);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetDealer), new { id = entity.Id }, entity);
        }

        // PUT: api/Dealers/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutDealer(int id, Dealer dealer)
        {
            var entity = await _context.Dealers.FindAsync(id);
            if (entity == null) return NotFound();

            if (!string.IsNullOrWhiteSpace(dealer.FullName)) entity.FullName = dealer.FullName.Trim();
            if (!string.IsNullOrWhiteSpace(dealer.PhoneNumber)) entity.PhoneNumber = dealer.PhoneNumber.Trim();
            if (!string.IsNullOrWhiteSpace(dealer.Email)) entity.Email = dealer.Email.Trim();
            if (!string.IsNullOrWhiteSpace(dealer.Username)) entity.Username = dealer.Username.Trim();
            if (!string.IsNullOrWhiteSpace(dealer.Password)) entity.Password = dealer.Password;
            entity.IsActive = dealer.IsActive;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/Dealers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDealer(int id)
        {
            var dealer = await _context.Dealers.FindAsync(id);
            if (dealer == null) return NotFound();
            _context.Dealers.Remove(dealer);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
