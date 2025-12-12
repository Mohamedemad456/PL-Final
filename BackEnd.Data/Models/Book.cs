// Role: Book Model Developer
// Developer: Mohamed Emad
using System.ComponentModel.DataAnnotations;

namespace BackEnd.Data.Models;

public class Book
{
    [Key]
    public Guid Id { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Author { get; set; } = string.Empty;
    
    [MaxLength(50)]
    public string? ISBN { get; set; }
    
    [MaxLength(1000)]
    public string? Description { get; set; }
    
    [Required]
    public int TotalCopies { get; set; }
    
    [Required]
    public int AvailableCopies { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation property
    public virtual ICollection<Borrowing> Borrowings { get; set; } = new List<Borrowing>();
}

