import * as React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const Overlay = ({
  children,
  title,
  tooltipClassName,
}: {
  children: React.ReactNode;
  title: React.ReactNode | string;
  tooltipClassName?: string;
}) => (
  <OverlayTrigger
    placement="top"
    delay={{ show: 0, hide: 400 }}
    overlay={(props: any) => (
      <Tooltip
        {...(tooltipClassName ? { className: tooltipClassName } : {})}
        {...props}
        show={props.show.toString()}
      >
        {title}
      </Tooltip>
    )}
  >
    <div className="text-truncate">{children}</div>
  </OverlayTrigger>
);
export default Overlay;
