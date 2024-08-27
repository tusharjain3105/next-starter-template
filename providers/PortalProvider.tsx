"use client";
import { isClient } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ComponentProps,
  createContext,
  PropsWithChildren,
  ReactNode,
  Suspense,
  use,
  useEffect,
  useState,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "../components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "../components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
} from "../components/ui/sheet";
import { Slot } from "@radix-ui/react-slot";

interface PortalProps {
  id?: string;
  variant?: "sidebar" | "drawer" | "dialog" | "drawer-dialog";
  header?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  options?: ComponentProps<typeof Drawer> &
    ComponentProps<typeof Dialog> &
    ComponentProps<typeof Sheet>;
  contentOptions?: ComponentProps<typeof DrawerContent> &
    ComponentProps<typeof DialogContent> &
    ComponentProps<typeof SheetContent>;
  headerOptions?: ComponentProps<typeof DrawerHeader> &
    ComponentProps<typeof DialogHeader> &
    ComponentProps<typeof SheetHeader>;
  footerOptions?: ComponentProps<typeof DrawerFooter> &
    ComponentProps<typeof DialogFooter> &
    ComponentProps<typeof SheetFooter>;
}

interface PortalComponentProps extends PortalProps {
  trigger?: ReactNode;
  content?: ReactNode;
}

export const PortalContext = createContext<{
  portal?: PortalProps;
  portals: PortalProps[];
  closePortal: () => void;
  onOpenChange: (value: boolean) => void;
  addPortal: (portal: PortalProps) => void;
  doesPortalExists: (id: string) => boolean;
}>(null as any);

export const usePortal = () => use(PortalContext);

export const PortalProvider = ({ children }: PropsWithChildren) => {
  const [portals, setPortals] = useState<PortalProps[]>([]);

  return (
    <PortalContext.Provider
      value={{
        portal: portals[portals.length - 1],
        portals,
        closePortal: () => setPortals(portals.slice(0, -1)),
        onOpenChange(value) {
          if (!value) setPortals(portals.slice(0, -1));
        },
        addPortal(portal) {
          setPortals([...portals, portal]);
        },
        doesPortalExists(id) {
          return !!portals.find((portal) => portal.id === id);
        },
      }}
    >
      <Suspense>
        {portals.map((portal, idx) => (
          <PortalViewer key={`portal-${idx}`} portal={portal} />
        ))}
      </Suspense>
      {children}
    </PortalContext.Provider>
  );
};

const PortalViewer = ({ portal }: { portal: PortalProps }) => {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const portalId = useSearchParams().get("portal");
  const pathname = usePathname();
  const { closePortal } = use(PortalContext);

  useEffect(() => {
    if (portal.id) {
      const url = new URL(location.href);
      url.searchParams.set("portal", portal.id);
      router.push(url.href);
    }
  }, [portal.id, router]);

  useEffect(() => {
    if (!portalId && portal.id) {
      closePortal?.();
    }
  }, [portalId, pathname, portal.id, closePortal]);

  if (!portal) return null;

  const onOpenChange = (value: boolean) => {
    if (!value) {
      setOpen(false);
      setTimeout(() => {
        closePortal?.();
      }, 150);
      if (portal.id && portal.id === portalId) {
        if (history.length < 3) {
          const url = new URL(location.href);
          url.searchParams.delete("portal");
          router.replace(url.href);
        } else {
          router.back();
        }
      }
    }
  };

  if (portal.variant === "drawer-dialog") {
    if (!isClient()) return null;
    portal.variant = innerWidth < 768 ? "drawer" : "dialog";
  }

  const {
    variant,
    children,
    header,
    footer,
    options = {},
    contentOptions = {},
    headerOptions = {},
    footerOptions = {},
  } = portal;

  switch (variant) {
    case "sidebar":
      return (
        <Sheet open={open} onOpenChange={onOpenChange} {...options}>
          <SheetContent {...contentOptions}>
            {header && <SheetHeader {...headerOptions}>{header}</SheetHeader>}
            {children}
            {footer && <SheetFooter {...footerOptions}>{footer}</SheetFooter>}
          </SheetContent>
        </Sheet>
      );

    case "dialog":
      return (
        <Dialog open={open} onOpenChange={onOpenChange} {...options}>
          <DialogContent {...contentOptions}>
            {header && <DialogHeader {...headerOptions}>{header}</DialogHeader>}
            {children}
            {footer && <DialogFooter {...footerOptions}>{footer}</DialogFooter>}
          </DialogContent>
        </Dialog>
      );

    case "drawer":
      return (
        <Drawer open={open} onOpenChange={onOpenChange} {...options}>
          <DrawerContent {...contentOptions}>
            {header && <DrawerHeader {...headerOptions}>{header}</DrawerHeader>}
            {children}
            {footer && <DrawerFooter {...footerOptions}>{footer}</DrawerFooter>}
          </DrawerContent>
        </Drawer>
      );
  }
};

const PortalWithoutSuspense = ({
  trigger,
  content,
  ...props
}: PortalComponentProps) => {
  const { addPortal, doesPortalExists } = use(PortalContext);
  if (!trigger && content) {
    trigger = props.children;
    props.children = content;
  }

  props.variant ||= "drawer-dialog";
  const portalId = useSearchParams().get("portal");
  if (props.id && props.id === portalId && !doesPortalExists(portalId)) {
    props.options ||= {};
    props.options.defaultOpen = true;
  }

  useEffect(() => {
    if (props.options?.defaultOpen) {
      addPortal(props);
    }
  }, [props.options?.defaultOpen]);

  return (
    <div role="button" onClick={() => addPortal(props)}>
      {trigger}
    </div>
  );
};

export default function Portal(props: PortalComponentProps) {
  return (
    <Suspense>
      <PortalWithoutSuspense {...props} />
    </Suspense>
  );
}

export const ClosePortal = ({ children }: PropsWithChildren) => {
  const { closePortal } = usePortal();
  return <div onClick={closePortal}>{children}</div>;
};
