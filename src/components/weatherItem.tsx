import { Weather } from '../types/weather';
interface weatherItemProps {
    weather: Weather;
}
export default function WeatherItem({ weather }: weatherItemProps) {
    return <div>{weather.title}</div>;
}
