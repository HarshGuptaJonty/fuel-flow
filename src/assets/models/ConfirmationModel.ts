export interface ConfirmationModel {
    heading: string,
    message?: string,

    leftButton?: Button,
    rightButton?: Button,
}

interface Button {
    text: string,
    customClass?: string,
    disabled?: boolean
}