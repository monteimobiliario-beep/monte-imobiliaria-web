import fs from 'fs';

let content = fs.readFileSync('types.ts', 'utf-8');
content = content.replace('employeeId: string;', 'employee_id: string;');
content = content.replace('checkIn: string;', 'check_in: string;');
content = content.replace('checkOut: string;', 'check_out: string;');
content = content.replace('startDate: string;', 'start_date: string;');
content = content.replace('endDate?: string;', 'end_date?: string;');
content = content.replace('salaryBase: number;', 'salary_base: number;');
content = content.replace('scheduledDate: string;', 'scheduled_date: string;');

fs.writeFileSync('types.ts', content);
