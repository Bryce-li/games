import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// 将ISO日期字符串格式化为 "Jun 19 2025" 格式
export function formatGameDate(dateString: string): string {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString; // 如果无法解析，返回原字符串
        }
        
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        
        return date.toLocaleDateString('en-US', options);
    } catch (error) {
        return dateString; // 出错时返回原字符串
    }
}
