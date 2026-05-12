using System;
using System.Collections.Generic;

namespace ServiceDesk.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Role { get; set; } // 'Student', 'Teacher', 'Admin', 'Support'
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public ICollection<Ticket> CreatedTickets { get; set; } = new List<Ticket>();
        public ICollection<Ticket> AssignedTickets { get; set; } = new List<Ticket>();
        public ICollection<TicketComment> Comments { get; set; } = new List<TicketComment>();
    }
}
