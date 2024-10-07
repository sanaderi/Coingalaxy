import dayjs from "dayjs"

export function formatUTCDate(dateString: number) {
  return dayjs.unix(dateString).format('YYYY-MM-DD HH:mm')

}
