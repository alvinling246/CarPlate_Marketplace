namespace CarPlateAPI.Models
{
    public class Dealer
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int UserId { get; set; }

        public User User { get; set; } = null!;
    }
}
