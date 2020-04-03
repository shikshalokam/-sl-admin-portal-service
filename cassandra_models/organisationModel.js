module.exports = {
    
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
        table_name: "organisation",
        indexes:["orgtype","orgname","channel","provider","orgcode","status","externalid"]
}
