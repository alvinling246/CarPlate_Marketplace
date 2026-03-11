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

        private static DealerDto ToDto(Dealer d)
        {
            return new DealerDto
            {
                Id = d.Id,
                FullName = d.FullName ?? "",
                PhoneNumber = d.PhoneNumber ?? "",
                Email = d.Email ?? "",
                UserId = d.UserId,
                Username = d.User?.Username ?? "",
                Role = d.User?.Role ?? "Dealer",
                IsActive = d.User?.IsActive ?? true,
                CreatedDate = d.User?.CreatedDate ?? default,
                LastLoginDate = d.User?.LastLoginDate
            };
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
            var user = await _context.Users
                .Include(u => u.Dealer)
                .FirstOrDefaultAsync(u => u.Role == "Dealer" && u.Username.ToLower() == username.ToLower());

            if (user?.Dealer == null)
                return Unauthorized(new { message = "Invalid username or password." });
            if (!user.IsActive)
                return Unauthorized(new { message = "This dealer account is inactive." });
            // Compare password (trim both to avoid whitespace issues)
            var storedPassword = user.Password?.Trim() ?? "";
            if (storedPassword != password.Trim())
                return Unauthorized(new { message = "Invalid username or password." });

            user.LastLoginDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { id = user.Dealer.Id, username = user.Username, fullName = user.Dealer.FullName, userId = user.Id, role = user.Role });
        }

        // GET: api/Dealers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DealerDto>>> GetDealers()
        {
            var dealers = await _context.Dealers
                .Include(d => d.User)
                .OrderByDescending(d => d.User.CreatedDate)
                .ToListAsync();
            return dealers.Select(ToDto).ToList();
        }

        // GET: api/Dealers/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DealerDto>> GetDealer(int id)
        {
            var dealer = await _context.Dealers
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.Id == id);
            if (dealer == null) return NotFound();
            return ToDto(dealer);
        }

        // POST: api/Dealers
        [HttpPost]
        public async Task<ActionResult<DealerDto>> PostDealer([FromBody] DealerUpsertRequest dealer)
        {
            if (string.IsNullOrWhiteSpace(dealer?.FullName))
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
            var exists = await _context.Users.AnyAsync(u => u.Username == usernameNorm);
            if (exists)
                return BadRequest(new { message = "A dealer with this username already exists." });

            var user = new User
            {
                Username = usernameNorm,
                Password = dealer.Password,
                Role = "Dealer",
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var entity = new Dealer
            {
                FullName = (dealer.FullName ?? "").Trim(),
                PhoneNumber = (dealer.PhoneNumber ?? "").Trim(),
                Email = (dealer.Email ?? "").Trim(),
                UserId = user.Id
            };
            _context.Dealers.Add(entity);
            await _context.SaveChangesAsync();

            entity.User = user;
            return CreatedAtAction(nameof(GetDealer), new { id = entity.Id }, ToDto(entity));
        }

        // PUT: api/Dealers/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutDealer(int id, [FromBody] DealerUpsertRequest dealer)
        {
            var entity = await _context.Dealers
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.Id == id);
            if (entity == null) return NotFound();

            if (!string.IsNullOrWhiteSpace(dealer?.FullName)) entity.FullName = dealer.FullName.Trim();
            if (!string.IsNullOrWhiteSpace(dealer?.PhoneNumber)) entity.PhoneNumber = dealer.PhoneNumber.Trim();
            if (!string.IsNullOrWhiteSpace(dealer?.Email)) entity.Email = dealer.Email.Trim();

            if (entity.User == null)
                return StatusCode(500, new { message = "Dealer user link is missing." });

            if (!string.IsNullOrWhiteSpace(dealer?.Username))
            {
                var usernameNorm = dealer.Username.Trim();
                var exists = await _context.Users.AnyAsync(u => u.Id != entity.UserId && u.Username == usernameNorm);
                if (exists)
                    return BadRequest(new { message = "A user with this username already exists." });
                entity.User.Username = usernameNorm;
            }
            if (!string.IsNullOrWhiteSpace(dealer?.Password))
                entity.User.Password = dealer.Password;
            if (dealer?.IsActive.HasValue == true)
                entity.User.IsActive = dealer.IsActive.Value;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/Dealers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDealer(int id)
        {
            var dealer = await _context.Dealers
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.Id == id);
            if (dealer == null) return NotFound();

            var user = dealer.User;
            _context.Dealers.Remove(dealer);
            await _context.SaveChangesAsync();

            if (user != null)
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
            }

            return NoContent();
        }
    }
}
