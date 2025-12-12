// Role: Borrow/Return Models
// Developer: Mohamed Emad
using System.ComponentModel.DataAnnotations;

namespace BackEnd.Data.Models;

public class BorrowRequest
{
    [Required]
    public Guid UserId { get; set; }
}

