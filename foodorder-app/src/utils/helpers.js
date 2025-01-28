import { toast } from 'vue3-toastify';
import moment from 'moment';

export function handleApiError(error)
{
    const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';
    toast.error('API Error: \n' + errorMessage);
}

export function handleValidationErrors(errors)
{
    toast.error('Validation Errors: \n' + errors.map(error => error.message).join("\n"));
}

export function handleSuccess(message)
{
    toast.success(message);
}

export function handleError(message)
{
    toast.error(message);
}

export function handleInfo(message)
{
    toast.info(message);
}

export function handleWarning(message)
{
    toast.warning(message);
}

export function handleConfirm(message)
{
    return confirm(message);
}

export function formatDate(date, format = 'YYYY-MM-DD')
{
    return moment(date).format(format);
}

export function formatDateTime(date, format = 'YYYY-MM-DD HH:mm:ss')
{
    return moment(date).format(format);
}

export function formatDateAgo(date)
{
    return moment(date).fromNow();
}

export function getTodayDate()
{
    return moment().startOf('day').toDate();
}

export function getYesterdayDate()
{
    return moment().subtract(1, 'days').startOf('day').toDate();
}

export function getCurrentMonth()
{
    return moment().format('MM');
}

export function getCurrentYear()
{
    return moment().format('YYYY');
}

export function getFirstDayOfMonth(date)
{
    return moment(date).startOf('month').toDate();
}

export function getLastDayOfMonth(date)
{
    return moment(date).endOf('month').toDate();
}

export function addDays(date, days)
{
    return moment(date).add(days, 'days').toDate();
}

export function subtractDays(date, days)
{
    return moment(date).subtract(days, 'days').toDate();
}

export function isSameDate(date1, date2)
{
    return moment(date1).isSame(date2, 'day');
}

export function isBeforeDate(date1, date2)
{
    return moment(date1).isBefore(date2);
}

export function isAfterDate(date1, date2)
{
    return moment(date1).isAfter(date2);
}
