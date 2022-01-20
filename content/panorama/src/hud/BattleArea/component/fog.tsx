import React from "react";

export const Fog = () =>{
    return <>
    <GenericPanel hittest={false} className={"fog"}  type={"DOTAParticleScenePanel"} particleName={"models/items/spectre/spectre_arcana/debut/particles/spectre_arcana_debut_frontpage_fog.vpcf"} particleonly="true"  startActive="true" cameraOrigin={"0 777 0"} lookAt={"0 0 0"} fov="50" />
    <GenericPanel hittest={false} className={"fog"}  type={"DOTAParticleScenePanel"} particleName={"particles/events/diretide/frontpage_diretide_fog.vpcf"} particleonly="true"  startActive="true" cameraOrigin={"222 777 0"} lookAt={"0 0 0"} fov="50" />
    <GenericPanel hittest={false} className={"fog"}  type={"DOTAParticleScenePanel"} particleName={"particles/events/diretide/frontpage_diretide_fog.vpcf"} particleonly="true"  startActive="true" cameraOrigin={"444 777 0"} lookAt={"0 0 0"} fov="50" />
    <GenericPanel hittest={false} className={"fog"}  type={"DOTAParticleScenePanel"} particleName={"models/items/spectre/spectre_arcana/debut/particles/spectre_arcana_debut_frontpage_fog.vpcf"} particleonly="true"  startActive="true" cameraOrigin={"777 777 0"} lookAt={"0 0 0"} fov="50" />
    <GenericPanel hittest={false} className={"fog"}  type={"DOTAParticleScenePanel"} particleName={"models/items/spectre/spectre_arcana/debut/particles/spectre_arcana_debut_frontpage_fog.vpcf"} particleonly="true"  startActive="true" cameraOrigin={"888 777 0"} lookAt={"0 0 0"} fov="50" />
    </> 
}