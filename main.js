let init = function () {
  let skillObjArr = [];
  let skills = document.querySelectorAll(".tag");

  skills.forEach((skill) => {
    skillObjArr.push({
      skillParent: skill,
      skillName: skill.id,
      skillImage:
        skill.id == "web3js"
          ? "./Images/web3js.jpeg"
          : `https://raw.githubusercontent.com/rahulbanerjee26/githubAboutMeGenerator/main/icons/${skill.id}.svg`,
      transitionImage: `./Images/${skill.id}-transitionColor.png`,
    });
  });

  skillObjArr.map((skillObj) => {
    new hoverEffect({
      parent: skillObj.skillParent,
      image1: skillObj.skillImage,
      image2: skillObj.transitionImage,
      displacementImage: "./Images/displacementImage.png",
    });
  });
};

document.addEventListener("load", init());
