import type { JSX, PropsWithChildren } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
    isOpen: boolean;
    title: string;
    footer: JSX.Element;
};

export default function Modal({ isOpen, children, title, footer }: PropsWithChildren<ModalProps>) {
    return isOpen
        ? createPortal(
              <dialog className="modal modal-bottom sm:modal-middle" open>
                  <div className="modal-box">
                      <h3 className="font-bold text-lg mb-3">{title}</h3>
                      {children}
                      <div className="modal-action mt-3">
                          <form method="dialog">{footer}</form>
                      </div>
                  </div>
              </dialog>,
              document.body,
          )
        : null;
}
