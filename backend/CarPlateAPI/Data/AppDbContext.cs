using Microsoft.EntityFrameworkCore;
using CarPlateAPI.Models;

namespace CarPlateAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Plate> Plates { get; set; }
        public DbSet<Dealer> Dealers { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Buyer> Buyers { get; set; }
        public DbSet<Transaction> Transactions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // dbo.dealers
            modelBuilder.Entity<Dealer>(entity =>
            {
                entity.ToTable("Dealers");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.FullName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PhoneNumber).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.HasOne(e => e.User)
                    .WithOne(u => u.Dealer)
                    .HasForeignKey<Dealer>(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // dbo.users - login accounts for different roles
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Password).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Role).IsRequired().HasMaxLength(50).HasDefaultValue("Dealer");
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("GETDATE()");
                entity.HasIndex(e => e.Username).IsUnique();
            });

            // dbo.plates - plate listings; buyer info is via Transaction
            modelBuilder.Entity<Plate>(entity =>
            {
                entity.ToTable("Plates");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.PlateNumber).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Category).HasMaxLength(50);
                entity.Property(e => e.AddedDate).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Available");
            });

            // dbo.buyers - optional many-to-one to Dealer (FullName/PhoneNumber/Email nullable when DealerId is set)
            modelBuilder.Entity<Buyer>(entity =>
            {
                entity.ToTable("Buyers");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.FullName).HasMaxLength(200);
                entity.Property(e => e.PhoneNumber).HasMaxLength(50);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.HasOne(e => e.Dealer)
                    .WithMany()
                    .HasForeignKey(e => e.DealerId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // dbo.transaction - unified reservation/sale table
            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.ToTable("Transaction");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.PlateNoId).IsRequired();
                entity.Property(e => e.PurchasedId).IsRequired();
                entity.Property(e => e.DealerOrBuyer).IsRequired();
                entity.Property(e => e.ReservedDate).HasColumnType("datetime");
                entity.Property(e => e.SoldDate).HasColumnType("datetime");
                entity.Property(e => e.SoldPrice).HasColumnType("float");
                entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
                entity.HasOne(e => e.Plate)
                    .WithMany()
                    .HasForeignKey(e => e.PlateNoId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Buyer)
                    .WithMany()
                    .HasForeignKey(e => e.PurchasedId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
