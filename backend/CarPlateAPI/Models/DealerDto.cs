namespace CarPlateAPI.Models
{
    public class DealerDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Role { get; set; } = "Dealer";
        public bool IsActive { get; set; } = true;
        public DateTime CreatedDate { get; set; }
        public DateTime? LastLoginDate { get; set; }
    }
}

