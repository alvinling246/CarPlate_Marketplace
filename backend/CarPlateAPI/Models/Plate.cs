namespace CarPlateAPI.Models
{
    /// <summary>Car plate listing. Status: Available, Reserved, Sold. Reserved/Sold details are in Reservation and Sale.</summary>
    public class Plate
    {
        public int Id { get; set; }
        public string PlateNumber { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int? BuyerId { get; set; }
        public string? Category { get; set; }
        public DateTime AddedDate { get; set; }
        /// <summary>One of: Available, Reserved, Sold</summary>
        public string Status { get; set; } = "Available";

        public Buyer? Buyer { get; set; }
    }
}
