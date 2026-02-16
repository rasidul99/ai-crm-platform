export interface CalendlySlot {
    startTime: string; // ISO 8601
    endTime: string;
    available: boolean;
}

export class CalendlyService {
    // Mock: Check availability for the next 3 days
    static async checkAvailability(): Promise<CalendlySlot[]> {
        const today = new Date();
        const slots: CalendlySlot[] = [];

        // Generate 3 slots for tomorrow
        for (let i = 1; i <= 3; i++) {
            const slotTime = new Date(today);
            slotTime.setDate(today.getDate() + 1);
            slotTime.setHours(10 + i * 2, 0, 0, 0); // 12:00, 14:00, 16:00

            const endTime = new Date(slotTime);
            endTime.setHours(slotTime.getHours() + 1);

            slots.push({
                startTime: slotTime.toISOString(),
                endTime: endTime.toISOString(),
                available: true
            });
        }
        return slots;
    }

    // Mock: Book a slot
    static async bookSlot(slotTime: string, leadEmail: string): Promise<boolean> {
        console.log(`[Calendly] Booking slot at ${slotTime} for ${leadEmail}`);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
    }
}
