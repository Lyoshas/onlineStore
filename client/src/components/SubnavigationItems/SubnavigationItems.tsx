import { Link } from 'react-router-dom';
import classNames from 'classnames';

import classes from './SubnavigationItems.module.css';

function SubnavigationItems<T extends { url: string; name: string }[]>(props: {
    links: T;
    selectedLink: T[0]['name'];
    divBlockClassName?: string;
    linkItemClassName?: string;
}) {
    return (
        <div
            className={classNames(
                classes['subnavigation-items'],
                props.divBlockClassName
            )}
        >
            {props.links.map((link, i) => (
                <Link
                    to={link.url}
                    className={classNames(
                        classes['subnavigation-items__link'],
                        props.linkItemClassName,
                        props.selectedLink === link.name &&
                            classes['subnevigation-item__link_underline']
                    )}
                    key={i}
                >
                    {link.name}
                </Link>
            ))}
        </div>
    );
}

export default SubnavigationItems;
