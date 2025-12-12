// Role: Borrow/Return Model
// Developer: Mohamed Emad
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackEnd.Data.Models;

public class Borrowing
{
    [Key]
    public Guid Id { get; set; }
    
    [Required]
    public Guid UserId { get; set; }
    
    [Required]
    public Guid BookId { get; set; }
    
    [Required]
    public DateTime BorrowedDate { get; set; }
    
    public DateTime? ReturnedDate { get; set; }
    
    [Required]
    public DateTime DueDate { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Active"; // Active, Returned, Overdue
    
    // Navigation properties
    [ForeignKey("UserId")]
    public virtual User? User { get; set; }
    
    [ForeignKey("BookId")]
    public virtual Book? Book { get; set; }
}

