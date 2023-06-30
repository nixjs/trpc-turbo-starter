import React from 'react'
import ReactJson from 'react-json-view'

const UserInfoComponent: React.FC<{ data: any }> = ({ data }) => {
    if (data) return <ReactJson theme={'google'} src={data} name="User Info" />
    return <></>
}

export default UserInfoComponent
