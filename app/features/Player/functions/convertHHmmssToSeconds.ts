export const convertHHMMSSToSeconds = (timeString: string) => {
  if (!timeString) {
    console.log("timeString is null");
    return; // timeStringがnull、undefined、空文字の場合は何もせずにreturn
  }

  const parts = timeString.split(":");
  if (parts.length !== 3) {
    return; // 時間の形式が "HH:mm:ss" でない場合は何もせずにreturn
  }
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};
