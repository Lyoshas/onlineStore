export default interface LiqpayDecodedData {
    action:
        | 'pay'
        | 'hold'
        | 'paysplit'
        | 'subscribe'
        | 'paydonate'
        | 'auth'
        | 'regular';
    status:
        | 'error'
        | 'failure'
        | 'reversed'
        | 'subscribed'
        | 'success'
        | 'unsubscribed'
        | '3ds_verify'
        | 'captcha_verify'
        | 'cvv_verify'
        | 'ivr_verify'
        | 'otp_verify'
        | 'password_verify'
        | 'phone_verify'
        | 'pin_verify'
        | 'receiver_verify'
        | 'sender_verify'
        | 'senderapp_verify'
        | 'wait_qr'
        | 'wait_sender'
        | 'cash_wait'
        | 'hold_wait'
        | 'invoice_wait'
        | 'prepared'
        | 'processing'
        | 'wait_accept'
        | 'wait_card'
        | 'wait_compensation'
        | 'wait_lc'
        | 'wait_reserve'
        | 'wait_secure';
    order_id: string;
    err_code?: string;
    [key: string]: any;
}
