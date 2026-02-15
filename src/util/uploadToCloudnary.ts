export const uploadToCloudinary = async (pics:any) => {

    const cloud_name="dn7ko6gut"
    
    if (pics) {
      
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "lrnwpmu4");
      data.append("cloud_name", cloud_name);
  
      const res = await 
      fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
        method: "post",
        body: data,
      })
        
        const fileData=await res.json();
        console.log("url : ", fileData);
        return fileData.url
  
    } else {
      console.log("error");
    }
  };