interface ITimeComposable {
  useDateTime: (inputDate: string, options?: Intl.DateTimeFormatOptions) => string;
  useTimeFormat: (inputDate: string, options?: Intl.DateTimeFormatOptions) => string;
  useFormatClockTime: (inputDate: string) => string;
  useTimeAgoFormat: (inputDate: string) => string;
  useFormatElapsedTime: (duration: number) => string;
}
const useTimeComposable = (): ITimeComposable => {
  const useDateTime = (
    inputDate: string,
    options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: undefined,
      timeZoneName: undefined,
    }
  ): string => {
    const date = new Date(inputDate);
    return date.toLocaleDateString(undefined, options);
  };
  const useTimeFormat = (
    inputDate: string,
    options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }
  ): string => {
    const date = new Date(inputDate);
    return date.toLocaleTimeString(undefined, options);
  };

  const useFormatClockTime = (inputDate: string) => {
    const diff = Math.round(new Date().getTime() - new Date(inputDate).getTime());
    let seconds = Math.floor(diff / 1000);
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    if (hours)
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    else return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  const useTimeAgoFormat = (inputDate: string) => {
    const diff = Math.round((new Date().getTime() - new Date(inputDate).getTime()) / 1000);
    // if the difference is less than a day
    if (diff < 86400) {
      return useTimeFormat(inputDate);
    }
    if (diff < 172800) {
      return 'Yesterday';
    }
    // if less than a week
    if (diff < 604800) {
      return useDateTime(inputDate, { weekday: 'long' });
    }
    return useDateTime(inputDate, { year: 'numeric', month: 'short', day: 'numeric' });
  };
  const useFormatElapsedTime = (duration: number) => {
    let seconds = Math.floor(duration / 1000);
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    if (hours)
      return `${hours} ${hours > 1 ? 'hours' : 'hour'} , ${minutes} ${minutes > 1 ? 'minutes' : 'minute'} and  ${seconds} ${seconds > 1 ? 'seconds' : 'second'}`;
    if (minutes)
      return `${minutes} ${minutes > 1 ? 'minutes' : 'minute'} and  ${seconds} ${seconds > 1 ? 'seconds' : 'second'}`;
    return `${seconds} ${seconds > 1 ? 'seconds' : 'second'}`;
  };

  return {
    useDateTime,
    useTimeFormat,
    useFormatClockTime,
    useTimeAgoFormat,
    useFormatElapsedTime,
  };
};

export default useTimeComposable;
