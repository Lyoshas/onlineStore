import { FC, useEffect, useRef } from 'react';

const RedirectToLiqpay: FC<{ data: string; signature: string }> = (props) => {
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (formRef.current === null) return;
        formRef.current.submit();
    }, [formRef.current]);

    return (
        <form
            method="POST"
            action="https://www.liqpay.ua/api/3/checkout"
            acceptCharset="utf-8"
            ref={formRef}
        >
            <input type="hidden" name="data" value={props.data} />
            <input type="hidden" name="signature" value={props.signature} />
        </form>
    );
};

export default RedirectToLiqpay;
