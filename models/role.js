module.exports = {
    schema:{
        fields:{
            id : "text",
            name: "text",
            rolegroupid : {
                type: "list",
                typeDef: "<varchar>"
            },  
            status:"int"
        },
        key:["id"],
        indexes:["name"]
    },
    name:"role",
    db_type:"cassandra"
}
