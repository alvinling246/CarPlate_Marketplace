namespace CarPlateAPI.Models
{
    public class Plate
    {
        public int Id { get; set; }
        public string PlateNumber { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public bool IsSold { get; set; }
        public string? Category { get; set; }
        public DateTime AddedDate { get; set; }
    }
}
