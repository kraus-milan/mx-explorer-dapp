import React from 'react';
import { faAngleLeft } from '@fortawesome/pro-solid-svg-icons/faAngleLeft';
import { faAngleRight } from '@fortawesome/pro-solid-svg-icons/faAngleRight';
import { faAnglesLeft } from '@fortawesome/pro-solid-svg-icons/faAnglesLeft';
import { faAnglesRight } from '@fortawesome/pro-solid-svg-icons/faAnglesRight';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { NetworkLink } from 'components';
import { activeNetworkSelector } from 'redux/selectors';
import { pagerHelper } from './pagerHelper';

export const Pager = ({
  total,
  show,
  page,
  itemsPerPage,
  className = '',
  hasTestId = true
}: {
  page: string;
  total: number | '...';
  itemsPerPage: number;
  show: boolean;
  className?: string;
  hasTestId?: boolean;
}) => {
  const { id: activeNetworkId } = useSelector(activeNetworkSelector);

  const { pathname: originalPathname } = useLocation();
  const pathname = activeNetworkId
    ? originalPathname.replace(`/${activeNetworkId}`, '')
    : originalPathname;

  const urlParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlParams);

  const { size, lastPage, end, paginationArray } = pagerHelper({
    total,
    itemsPerPage,
    page
  });

  const nextUrlParams = new URLSearchParams({
    ...params,
    page: `${size + 1}`
  }).toString();

  const { page: urlPage, ...rest } = params;

  const firstUrlParams = new URLSearchParams({
    ...rest
  }).toString();
  const prevUrlParams = new URLSearchParams({
    ...params,
    page: `${size - 1}`
  }).toString();

  const prevPageUrl =
    size === 2
      ? `${pathname}?${firstUrlParams}`
      : `${pathname}?${prevUrlParams}`;

  const startEnd = size;

  const lastUrlParams = new URLSearchParams({
    ...params,
    page: `${lastPage}`
  }).toString();

  const leftBtnActive = size !== 1;
  const rightBtnsActive = end < total;

  return show ? (
    <div className={`pager ${className}`}>
      <div className='m-0 d-flex align-items-strech'>
        <div
          className={`btns-contrainer left ${leftBtnActive ? '' : 'inactive'}`}
        >
          {size === 1 ? (
            <div className='btn btn-pager square'>
              <FontAwesomeIcon icon={faAnglesLeft} size='lg' />
            </div>
          ) : (
            <NetworkLink
              className='btn btn-pager square'
              {...(hasTestId ? { 'data-testid': 'nextPageButton' } : {})}
              to={`${pathname}?${firstUrlParams}`}
            >
              <FontAwesomeIcon icon={faAnglesLeft} size='lg' />
            </NetworkLink>
          )}

          {size === 1 ? (
            <div
              className='btn btn-pager'
              {...(hasTestId
                ? { 'data-testid': 'disabledPreviousPageButton' }
                : {})}
            >
              <FontAwesomeIcon icon={faAngleLeft} size='lg' />
              <span className='d-none d-sm-flex ps-2'>Prev</span>
            </div>
          ) : (
            <NetworkLink
              className='btn btn-pager'
              to={prevPageUrl}
              {...(hasTestId ? { 'data-testid': 'previousPageButton' } : {})}
            >
              <FontAwesomeIcon icon={faAngleLeft} size='lg' />
              <span className='d-none d-sm-flex ps-2'>Prev</span>
            </NetworkLink>
          )}
        </div>

        <div className='d-flex align-items-center page-holder'>
          {paginationArray.map((page, index) => {
            const currentUrlParams = new URLSearchParams({
              ...params,
              page: String(page)
            }).toString();

            return (
              <React.Fragment key={`${page}-${index}`}>
                {page !== '...' ? (
                  <NetworkLink
                    className={`btn btn-pager ${page === size ? 'active' : ''}`}
                    to={`${pathname}?${currentUrlParams}`}
                  >
                    {page}
                  </NetworkLink>
                ) : (
                  <span>...</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div
          className={`btns-contrainer right ${
            rightBtnsActive ? '' : 'inactive'
          }`}
        >
          {total === '...' || end < total ? (
            <NetworkLink
              className='btn btn-pager'
              {...(hasTestId ? { 'data-testid': 'nextPageButton' } : {})}
              to={`${pathname}?${nextUrlParams}`}
            >
              <span className='d-none d-sm-flex pe-2'>Next</span>
              <FontAwesomeIcon icon={faAngleRight} size='lg' />
            </NetworkLink>
          ) : (
            <div
              className='btn btn-pager'
              {...(hasTestId
                ? { 'data-testid': 'disabledNextPageButton' }
                : {})}
            >
              <span className='d-none d-sm-flex pe-2'>Next</span>
              <FontAwesomeIcon icon={faAngleRight} size='lg' />
            </div>
          )}

          {!isNaN(lastPage) && end < total ? (
            <NetworkLink
              className='btn btn-pager square'
              {...(hasTestId ? { 'data-testid': 'nextPageButton' } : {})}
              to={`${pathname}?${lastUrlParams}`}
            >
              <FontAwesomeIcon icon={faAnglesRight} size='lg' />
            </NetworkLink>
          ) : (
            <span className='btn btn-pager square'>
              <FontAwesomeIcon icon={faAnglesRight} size='lg' />
            </span>
          )}
        </div>
      </div>
    </div>
  ) : null;
};
