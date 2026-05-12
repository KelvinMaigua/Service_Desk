using System;

namespace ServiceDesk.Models
{
    public class TicketHistory
    {
        public int Id { get; set; }
        public int TicketId { get; set; }
        public int ChangedByUserId { get; set; }
        public string FieldName { get; set; }
        public string OldValue { get; set; }
        public string NewValue { get; set; }
        public DateTime ChangedAt { get; set; }

        // Navigation properties
        public Ticket Ticket { get; set; }
        public User ChangedBy { get; set; }
    }
}
