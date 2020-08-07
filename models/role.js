module.exports = {
    schema:{
        fields:{
            id : "text",
            name: "text",
            rolegroupid : {
                type: "list",
                typeDef: "<text>"
            },  
            status:"int"
        },
        key:["id"],
        indexes:["name"]
    },
    name:"role",
    db_type:"cassandra"
}
