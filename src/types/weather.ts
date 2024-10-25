// types/weather.ts

export interface ForecastWeather {
    city: string; // Tên thành phố
    date: string; // Ngày dự báo
    temperature: number; // Nhiệt độ trung bình (°C)
    conditionText: string; // Tình trạng thời tiết văn bản
    conditionIcon: string; // Tình trạng thời tiết hình ảnh
    wind_speed: number; // Tốc độ gió (km/h)
    humidity: number; // Độ ẩm (%)
}

export interface ApiResponse {
    success: boolean;
    currentWeather?: CurrentWeather;
    forecastWeather?: ForecastWeather[];
    totalForecastDays?: number;
    message?: string; // Thông điệp lỗi nếu có
}

// Type cho dữ liệu thời tiết hiện tại nếu cần
export interface CurrentWeather {
    city: string; // Tên thành phố
    date: string; // Ngày hiện tại
    temperature: number; // Nhiệt độ hiện tại (°C)
    wind_speed: number; // Tốc độ gió hiện tại (M/S)
    humidity: number; // Độ ẩm hiện tại (%)
    conditionText: string; // Tình trạng thời tiết văn bản
    conditionIcon: string; // Tình trạng thời tiết hình ảnh
}
