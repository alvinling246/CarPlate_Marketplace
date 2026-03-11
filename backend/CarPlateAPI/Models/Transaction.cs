namespace CarPlateAPI.Models
{
    /// <summary>
    /// Unified reservation/sale record for a plate.
    /// DealerOrBuyer: 1 = registered dealer (Buyer row linked to DealerId), 0 = normal buyer.
    /// </summary>
    public class Transaction
    {
        public int Id { get; set; }
        public int PlateNoId { get; set; }

        // PurchasedId in DB (kept as BuyerId in code semantics)
        public int PurchasedId { get; set; }
        public int DealerOrBuyer { get; set; }

        public DateTime? ReservedDate { get; set; }
        public DateTime? SoldDate { get; set; }
        public double? SoldPrice { get; set; }
        public string Status { get; set; } = "Reserved"; // Reserved, Cancelled, Sold, etc.

        public Plate Plate { get; set; } = null!;
        public Buyer Buyer { get; set; } = null!;
    }
}

