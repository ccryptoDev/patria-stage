import React from "react";
import styled from "styled-components";
import Home from "../components/atoms/Icons/SvgIcons/Home";
import Avatar from "../components/atoms/Icons/SvgIcons/Avatar";
import Logout from "../components/atoms/Icons/SvgIcons/Logout";
import Card from "../components/atoms/Cards/Large";
import Arrow from "../components/atoms/Icons/SvgIcons/Arrow";
import Settings from "../components/atoms/Icons/SvgIcons/Settings";
import { Chevron } from "../components/atoms/Icons/SvgIcons/Chevron";
import TrashCan from "../components/atoms/Icons/SvgIcons/Delete";
import Edit from "../components/atoms/Icons/SvgIcons/Edit";
import Status, {
  SuccessIcon,
} from "../components/atoms/Icons/SvgIcons/Status-outlined";
import ShowPassword from "../components/atoms/Icons/SvgIcons/ShowPassword";
import HidePassword from "../components/atoms/Icons/SvgIcons/HidePassword";
import Error from "../components/atoms/Icons/SvgIcons/Error-solid";
import Lock from "../components/atoms/Icons/SvgIcons/Lock";
import Login from "../components/atoms/Icons/SvgIcons/Login";
import Upload from "../components/atoms/Icons/SvgIcons/Upload";
import Mail from "../components/atoms/Icons/SvgIcons/Mail";
import File from "../components/atoms/Icons/SvgIcons/File";
import Folder from "../components/atoms/Icons/SvgIcons/Folder";
import Forward from "../components/atoms/Icons/SvgIcons/Forward";

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  .card {
    margin: 2rem;
  }
  .item {
    padding: 2rem;
  }
`;

export default {
  title: "Example/Icons",
};

export const Icons = () => (
  <Wrapper>
    <Card className="card">
      <div className="item">
        <h3>Home</h3>
        <Home size="3rem" color="#3E7BFA" />
        <Home size="5rem" />
      </div>
    </Card>
    <Card className="card">
      <div className="item">
        <h3>Avatar</h3>
        <Avatar size="3rem" color="#3E7BFA" />
        <Avatar size="5rem" />
      </div>
    </Card>
    <Card className="card">
      <div className="item">
        <h3>Logout</h3>
        <Logout size="3rem" color="#28293D" />
        <Logout size="5rem" color="#3E7BFA" />
      </div>
    </Card>
    <Card className="card">
      <div className="item">
        <h3>Login</h3>
        <Login size="3rem" color="#3E7BFA" />
        <Login size="5rem" />
      </div>
    </Card>

    <Card className="card">
      <div className="item">
        <h3>Show Password</h3>
        <ShowPassword size="3rem" color="#3E7BFA" />
        <ShowPassword size="5rem" />
      </div>
    </Card>
    <Card className="card">
      <div className="item">
        <h3>Hide Password</h3>
        <HidePassword size="3rem" color="#3E7BFA" />
        <HidePassword size="5rem" />
      </div>
    </Card>
    <Card className="card">
      <div className="item">
        <h3>Lock</h3>
        <Lock size="3rem" color="#3E7BFA" />
        <Lock size="5rem" />
      </div>
    </Card>

    <Card className="card">
      <div className="item">
        <h3>Arrow</h3>
        <div style={{ transform: "rotate(90deg)", width: "3rem" }}>
          <Arrow color="green" />
        </div>
        <Arrow size="3rem" />
      </div>
    </Card>
    <Card className="card">
      <div className="item">
        <h3>Chevron</h3>
        <div style={{ transform: "rotate(180deg)", width: "3rem" }}>
          <Chevron color="#28293D" size="30" />
        </div>
        <Chevron size="3rem" />
      </div>
    </Card>
    <Card className="card">
      <div className="item">
        <h3>Settings</h3>
        <Settings size="30" />
        <Settings size="5rem" color="#000" />
      </div>
    </Card>
    <Card className="card">
      <div className="item">
        <h3>Delete</h3>
        <TrashCan size="3rem" />
        <TrashCan size="5rem" />
      </div>
    </Card>
    <Card className="card">
      <div className="item">
        <h3>Error</h3>
        <Error size="3rem" color="red" />
        <Error size="5rem" />
      </div>
    </Card>
    <Card className="card">
      <div className="item">
        <h3>Edit</h3>
        <Edit size="30" />
        <Edit size="5rem" color="#28293D" />
      </div>
    </Card>
    <Card className="card">
      <div className="item">
        <h3>Success icon</h3>
        <SuccessIcon size="20" />
      </div>
    </Card>

    <Card className="card">
      <div className="item">
        <h3>Status</h3>
        <Status size="30" />
        <Status size="5rem" color="#28293D" />
      </div>
    </Card>

    <Card className="card">
      <div className="item">
        <h3>Upload</h3>
        <Upload size="3rem" color="#3E7BFA" />
        <Upload size="5rem" />
      </div>
    </Card>

    <Card className="card">
      <div className="item">
        <h3>Mail</h3>
        <Mail size="3rem" color="#3E7BFA" />
        <Mail size="5rem" />
      </div>
    </Card>

    <Card className="card">
      <div className="item">
        <h3>File</h3>
        <File size="3rem" color="#3E7BFA" />
        <File size="5rem" />
      </div>
    </Card>

    <Card className="card">
      <div className="item">
        <h3>Folder</h3>
        <Folder size="3rem" color="#3E7BFA" />
        <Folder size="5rem" />
      </div>
    </Card>

    <Card className="card">
      <div className="item">
        <h3>Forward</h3>
        <Forward size="3rem" color="#3E7BFA" />
        <Forward size="5rem" />
      </div>
    </Card>
  </Wrapper>
);
