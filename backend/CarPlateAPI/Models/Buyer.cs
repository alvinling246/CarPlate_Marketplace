namespace CarPlateAPI.Models
{
    /// <summary>Potential or actual buyer; may be linked to a dealer (DealerId). When DealerId is set, FullName/PhoneNumber/Email may be null (use Dealer's info).</summary>
    public class Buyer
    {
        public int Id { get; set; }
        public int? DealerId { get; set; }
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }

        public Dealer? Dealer { get; set; }
    }
}
