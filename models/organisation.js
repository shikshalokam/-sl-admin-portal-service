module.exports = {
    schema:{
        fields:{
            id : "text",
            addressid   : "text",
            approvedby   : "text",
            approveddate   : "text",
            channel   : "text",
            communityid   : "text",
            contactdetail   : "text",
            createdby   : "text",
            createddate   : "text",
            datetime : "timestamp",
            description   : "text",
            externalid   : "text",
            hashtagid   : "text",
            homeurl   : "text",
            imgurl   : "text",
            isapproved : "boolean",
            isdefault : "boolean",
            isrootorg : "boolean",
            isssoenabled: "boolean",
            keys :  {
                type: 'frozen'
            },
            locationid   : "text",
            locationids : {
                type: "list",
                typeDef: "<varchar>"
            },  
            noofmembers : "int",
            orgcode   : "text",
            orgname   : "text",
            orgtype   : "text",
            orgtypeid   : "text",
            parentorgid   : "text",
            preferredlanguage   : "text",
            provider   : "text",
            rootorgid   : "text",
            slug   : "text",
            status : "int",
            theme   : "text",
            thumbnail   : "text",
            updatedby   : "text",   
            updateddate   : "text"
          
        },
        key:["id"],
        indexes:["orgtype","orgname","channel","provider","orgcode","status","externalid"]
    },
    name:"organisation",
    db_type:"cassandra"
}
