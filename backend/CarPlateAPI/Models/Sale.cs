namespace CarPlateAPI.Models
{
    /// <summary>Completed sale of a plate. May reference the reservation it came from (ReservationId nullable).</summary>
    public class Sale
    {
        public int Id { get; set; }
        public int PlateNoId { get; set; }
        public int BuyerId { get; set; }
        public int? ReservationId { get; set; }
        public DateTime SoldDate { get; set; }
        public decimal SoldPrice { get; set; }

        public Plate Plate { get; set; } = null!;
        public Buyer Buyer { get; set; } = null!;
        public Reservation? Reservation { get; set; }
    }
}
