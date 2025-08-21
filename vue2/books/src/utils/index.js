import { ElNotification } from 'element-plus';

export const notify = (title,message, type) => {
    ElNotification({
        title,
        message,
        type,
        duration: 2000,
    })
}