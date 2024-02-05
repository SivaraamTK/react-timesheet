import React from "react";

const SideNavBar = () => {
  const items = [
    { label: "Dashboard", icon: "pi pi-fw pi-home" },
    {
      label: "Timesheet",
      icon: "pi pi-fw pi-clock",
      className: "p-menuitem-active",
    },
    { label: "Leave", icon: "pi pi-fw pi-calendar-plus" },
    { label: "Work from Home", icon: "pi pi-fw pi-home" },
    { label: "Feedback", icon: "pi pi-fw pi-comment" },
    { label: "Survey", icon: "pi pi-fw pi-question-circle" },
    { label: "Service Desk", icon: "pi pi-fw pi-desktop" },
    { label: "Forms", icon: "pi pi-fw pi-file" },
    { label: "Travel", icon: "pi pi-fw pi-car" },
    { label: "Expenses", icon: "pi pi-fw pi-wallet" },
    { label: "Resources", icon: "pi pi-fw pi-globe" },
  ];

  return (
    <div
      className="p-panelmenu-wrapper"
      style={{
        paddingTop: "10px",
        background: "linear-gradient(to bottom, #19105b, #fe6095 )",
        color: "#ffffff",
        width: "250px",
        height: "100vh",
      }}
    >
      <div
        className="p-panelmenu-header"
        style={{
          display: "flex",
          paddingLeft: "50px",
          justifyContent: "left",
        }}
      >
        <img
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAiCAYAAACqVHINAAAABHNCSVQICAgIfAhkiAAAAjZJREFUSEu1lj1IHFEUhR2wEIloYSGCsChEJAYTAoqCGDAoBCL+BBLSWRqEVBY2Foq9naWVkDpCGlEECy0UTGxcjPiDxSYkFlkhFsL6HXm7mHVn3nV298Jlduedc7+5b97Mm6CixJHJZBKUHCL7yA4yEZSKQfE6ak2Tk/k1SwIB8JTCK2RtoYsuGgKgh8JLYQBBi4IAeEKNz1GAUkCWKdLpu6+xO6GLYYrP+wBFdQJE0/S4bBAANRRftQBidwLkOeaFckNGAUyUG/IBgNIUsVYX0/WO6kpTxIW8pfqYiRD3iaeTEbx6TkwRt5M3VFeaIi7kNdWVpgho/Z9TnnL8Qi4HQfAtyo1nkPEBE0H3BMOvAuKvnJsBdlaoEJ5XnO9/COQoRPyX8xOAtvPHgbzknNIU6mTPo1RHmsZc4Onlj9IUgmx6lGnGPwE6zOrwdPNbO6IpBNH8++InkPE7EG1UXT5TdlwQ7c/VBsMioA3p8LzgoLREWpAplK0G9RmQWQd5xlFpiZQgej3oQ8wSc4Au8LQj1meQJZKCNKD8aFGjWQJyjKeN30pLrN2+VjC959BkcKwD2UWvvd2yv/9Bv5WFNGLS96svdjDtAGlG2OITM76NPp17QTqj1n9UfMe0jzaBSBkVB2hTEvz3FnY3VFcZFkmMSQPkHN2PbJF7r3q3EMJu6jHmEw8k10EoxC2EKjcdWnl34yQCoqnR+FX+NERuWlxxJYZ68pHLlObZdasLuHT5m/PXYXN8A0QF5eZCS3rAAAAAAElFTkSuQmCC"
          alt="Brand Logo"
        />
      </div>
      <div className="p-panelmenu-content">
        <ul
          style={{
            alignContent: "left",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
          }}
        >
          {items.map((item, index) => (
            <li
              key={index}
              style={{
                listStyleType: "none",
                color: "white",
                backgroundColor: "transparent",
                padding: "10px",
              }}
            >
              <a
                href="#/"
                style={{
                  color: "white",
                  backgroundColor: "transparent",
                  textDecoration: "none",
                }}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <hr />
      <div className="p-panelmenu-footer" style={{ padding: "5px" }}>
        <span style={{ float: "left", paddingLeft: "30px" }}>John Doe </span>
        <i
          className="pi pi-sign-out"
          style={{
            fontSize: "1 em",
            float: "right",
            paddingRight: "30px",
            paddingTop: "3px",
          }}
        ></i>
      </div>
    </div>
  );
};

export default SideNavBar;
