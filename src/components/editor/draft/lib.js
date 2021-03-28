/**
 * Reading time.
 */
export const GetReadingTime = words => {
  let seconds = Math.ceil((words / 200) * 60);

  if (seconds < 60) {
    return `${seconds} sec`;
  }

  if (seconds > 60 && seconds < 60 * 60) {
    return `${Math.floor(seconds / 60)} min`;
  }

  if (seconds > 60 * 60) {
    let hours = Math.floor(seconds / (60 * 60));
    let minutes = Math.floor((seconds - hours * (60 * 60)) / 60);

    return `${hours > 1 ? hours + ' hours' : hours + ' hour'}, ${minutes} min`;
  }
};
