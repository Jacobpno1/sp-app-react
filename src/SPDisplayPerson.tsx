import React, { useState, useEffect } from "react";
import { mergeStyleSets } from "@uifabric/styling";
import { Link } from "@fluentui/react";
import { sp } from "@pnp/sp";

interface SPDisplayPersonProps {
  userId?: number
}

const pnpList_Users = sp.web.siteUsers;
const classNames = mergeStyleSets({
  exampleRoot: {
    marginTop: '20px',
  },
  nameText: {
    fontWeight: 'bold',
  },
});

export function SPDisplayPerson(props: SPDisplayPersonProps){
  const [state, setState] = useState({
    UserName: null,
    Email: null
  })

  useEffect(() => {
    props.userId && !state.UserName ? getUser(props.userId) : null
  }, [props.userId])

  const getUser = async (userId: number) => {
    const user = await pnpList_Users.getById(userId).get()
    setState({
      UserName: user.Title,
      Email: user.Email
    })
  }
  return (<>
    {state.UserName
    ? <Link
      className={classNames.nameText}
      title={"Click to email " + state.UserName}
      onClick={() => {
        window.location.href = "mailto:" + state.Email
      }}
    >
      {state.UserName}
    </Link>
    : <span>Loading...</span>}
  </>)
}