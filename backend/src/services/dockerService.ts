import { exec } from 'child_process';
import util from "util";
import fs from "fs/promises";
import path from "path";
import yaml from "js-yaml";

const execAsync = util.promisify(exec);
const COMPOSE_FILES_DIR = path.resolve(__dirname, "../../vm-compose-files");

// OS-specific Docker image configurations
const OS_CONFIGS: Record<string, {
    image: string;
    environment: string[];
    vncPort: number; // The internal port exposed by the image for web VNC
}> = {
    ubuntu: {
        image: "accetto/ubuntu-vnc-xfce-g3",
        environment: [
            "VNC_PW=password",
            "STARTUP_WAIT=5"
        ],
        vncPort: 6901
    },
    kali: {
        image: "kasmweb/kali-rolling-desktop:1.15.0",
        environment: [
            "VNC_PW=password",
            "KASM_PORT=6901"
        ],
        vncPort: 6901
    }
};

export async function createDockerContainer(
    userId: number,
    vmName: string,
    vmCount: number,
    osType: 'ubuntu' | 'kali' = 'ubuntu'
) {
    const config = OS_CONFIGS[osType] || OS_CONFIGS.ubuntu;

    // 1. Create a truly unique port and name
    const portOffset = userId + vmCount;
    const novncPort = 6280 + portOffset;

    // Unique name prevents Docker "Name already in use" errors
    const containerName = `ssem-vm-u${userId}-n${vmCount}`;
    const projectName = `vm_u${userId}_n${vmCount}`;

    // 2. Build the compose config based on OS type
    const serviceConfig: any = {
        image: config.image,
        container_name: containerName,
        ports: [
            `0.0.0.0:${novncPort}:${config.vncPort}`
        ],
        environment: config.environment,
        privileged: true,
        shm_size: '1gb'
    };

    const composeConfig = {
        version: "3.8",
        services: {
            sandbox_vm: serviceConfig,
        },
    };

    // 3. Save unique .yml file
    const yamlStr = yaml.dump(composeConfig);
    const filePath = path.join(COMPOSE_FILES_DIR, `docker-compose.${projectName}.yml`);

    await fs.mkdir(COMPOSE_FILES_DIR, { recursive: true });
    await fs.writeFile(filePath, yamlStr);

    // 4. Start Docker
    await execAsync(`docker-compose -f "${filePath}" -p "${projectName}" up -d`);

    // The link format differs per image:
    // - Ubuntu (accetto): HTTP on /vnc.html
    // - Kali (kasmweb):   HTTPS on root /
    const realLink = osType === 'kali'
        ? `https://13.60.170.3:${novncPort}/`
        : `http://13.60.170.3:${novncPort}/vnc.html?autoconnect=true`;

    return {
        port: novncPort,
        containerName,
        link: realLink
    };
}

export async function startDockerContainer(userId: number, vmCount: number) {
    const projectName = `vm_u${userId}_n${vmCount}`;
    const filePath = path.join(COMPOSE_FILES_DIR, `docker-compose.${projectName}.yml`);

    // Starts the existing container defined in the yml
    await execAsync(`docker-compose -f "${filePath}" -p "${projectName}" start`);
}

export async function stopDockerContainer(userId: number, vmCount: number) {
    const projectName = `vm_u${userId}_n${vmCount}`;
    const filePath = path.join(COMPOSE_FILES_DIR, `docker-compose.${projectName}.yml`);

    // Stops the running container
    await execAsync(`docker-compose -f "${filePath}" -p "${projectName}" stop`);
}

export async function removeDockerContainer(userId: number, vmCount: number) {
    const projectName = `vm_u${userId}_n${vmCount}`;
    const filePath = path.join(COMPOSE_FILES_DIR, `docker-compose.${projectName}.yml`);

    // 'down' stops and removes the container and network
    await execAsync(`docker-compose -f "${filePath}" -p "${projectName}" down`);

    // Delete the physical yml file
    if (await fs.stat(filePath).catch(() => false)) {
        await fs.unlink(filePath);
    }
}