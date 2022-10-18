import React from "react";
import Button from "@material-ui/core/Button";
import { Link, useHistory } from "react-router-dom";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import ListItemText from "@material-ui/core/ListItemText";
import MenuList from "@material-ui/core/MenuList";
import { Wrapper, ListItem, DropDown } from "../Styles";
import Avatar from "../../../../atoms/Icons/SvgIcons/Avatar";
import Logout from "../../../../atoms/Icons/SvgIcons/Logout";
import Lock from "../../../../atoms/Icons/SvgIcons/Lock";
import { logout } from "../../../../../api/authorization";
import { useUserData } from "../../../../../contexts/user";
import { routes } from "../../../../../routes/Application/routes";
// import { routes as borrowerRoutes } from "../../../../../routes/Borrower/routes";

type Props = {
  user: {
    img: string;
  };
};

export default function MenuListComposition({ user }: Props) {
  const { setUser } = useUserData();
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);
  const history = useHistory();

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: React.MouseEvent<EventTarget>) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  const handleListKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    }
  };

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      // eslint-disable-next-line
      anchorRef.current!.focus();
    }

    prevOpen.current = open;
  }, [open]);

  const onLogout = async () => {
    setUser({ data: {}, isAuthorized: false });
    history.push(routes.LOGIN);
  };

  return (
    <Wrapper>
      <div>
        <Button
          ref={anchorRef}
          aria-controls={open ? "menu-list-grow" : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
          className="avatar"
        >
          {user.img && user.img.length > 3 ? (
            <img src={user?.img} alt="user" />
          ) : (
            <Avatar size="3rem" />
          )}
        </Button>
        <DropDown
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          disablePortal
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === "bottom" ? "center top" : "center bottom",
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList
                    autoFocusItem={open}
                    id="menu-list-grow"
                    onKeyDown={handleListKeyDown}
                  >
                    <ListItem onClick={handleClose}>
                      <div className="item-wrapper">
                        <Link to="/">
                          <Lock />
                          <span>Change Password</span>
                        </Link>
                      </div>
                    </ListItem>
                    <ListItem onClick={handleClose}>
                      <div className="item-wrapper">
                        <button type="button" onClick={() => logout(onLogout)}>
                          <Logout />
                          <ListItemText primary="Logout" />
                        </button>
                      </div>
                    </ListItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </DropDown>
      </div>
    </Wrapper>
  );
}
