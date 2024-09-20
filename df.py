import subprocess
import psutil
import re
import os
import shutil

pools = {
    'pool1': {
        'master': '\\\\192.168.2.64\\data18',
        'slave': '\\\\192.168.2.65\\data18'
    },
    'pool2': {
        'master': '\\\\192.168.2.64\\data16',
        'slave': '\\\\192.168.2.65\\data16'
    }
}

def get_network_drives():
    network_drives = []
    try:
        command = "net use"
        result = subprocess.run(command, capture_output=True, text=True, shell=True)
        output = result.stdout

        drive_pattern = re.compile(r'([A-Z]:)\s+\\\\([^\s]+)')
        valid_ips = ['192.168.2.64', '192.168.2.65']
        for line in output.splitlines():
            match = drive_pattern.search(line)
            if match:
                drive_letter = match.group(1)
                network_path = f"\\\\{match.group(2)}"
                ip_address = network_path.split('\\')[2]
                if any(ip_address.startswith(ip) for ip in valid_ips):
                    network_drives.append((drive_letter, network_path))
    except Exception as e:
        print(f"Error fetching network drives: {e}")
    
    return network_drives

def get_drive_space_info(drive_letter):
    try:
        usage = psutil.disk_usage(drive_letter)
        total_space = usage.total / (1024**3)  
        free_space = usage.free / (1024**3)   
        return round(total_space, 2), round(free_space, 2)
    except Exception as e:
        print(f"Error retrieving space info for {drive_letter}: {e}")
        return None, None
    
def get_shards_by_pool(pool_name):
    pool = pools.get(pool_name)
    print("pool", pool)
    if not pool:
        print(f"Pool {pool_name} not found.")
        return []

    shards = []
    for drive_type, path in pool.items():
        network_drives = get_network_drives()
        print("net", network_drives)
        drive_letter = next((drive[0] for drive in network_drives if drive[1] == path), None)
        if drive_letter:
            with os.scandir(drive_letter) as entries:
                for entry in entries:
                    folder_path = os.path.join(drive_letter, entry.name)
                    print("folder", folder_path)
                    if entry.is_dir():
                    
                        outer_folder_size = get_outer_folder_size(folder_path) 
                        print("outer", outer_folder_size)

                  

                    

                        if outer_folder_size is not None :
                           
                            shards.append({
                                'pool': pool_name,
                                'type': drive_type,
                                'folder': entry.name,
                       
                                'outer_folder_size': outer_folder_size,
                                'network_path': folder_path
                            })
                        print(shards)
    return shards



def get_outer_folder_size(folder_path):
   
    total_size = 0
    try:
     
        total_size += os.path.getsize(folder_path)
        print("outer folder", folder_path)

       
        with os.scandir(folder_path) as entries:
            for entry in entries:
                item_path = os.path.join(folder_path, entry.name)
                print("folder item", item_path)
                
                if entry.is_file():
                    file_size = os.path.getsize(item_path)
                    total_size += file_size
                    print(f"Size of {entry.name}: {file_size}, Total size: {total_size}")
                elif entry.is_dir():
                    folder_size = os.path.getsize(item_path)
                    total_size += folder_size
                    print(f"Size of {entry.name}: {folder_size}, Total size: {total_size}")
    except OSError as e:
        print(f"Error calculating folder size for {folder_path}: {e}")
        return None

    return total_size




def append_subfolder_sizes(shards):

    for shard in shards:

        folder_path=shard['network_path']

        subfolder_sizes=get_subfolder_sizes(folder_path)

        shard['subfolder_sizes']=subfolder_sizes

        print(f"appended subfolder {folder_path} :{subfolder_sizes}")
def get_subfolder_sizes(folder_path):
    """Separate function to calculate the sizes of subfolders without affecting the outer folder size calculation."""
    subfolder_sizes = {}

    try:
        with os.scandir(folder_path) as entries:
            for entry in entries:
                if entry.is_dir():
                    subfolder_path = os.path.join(folder_path, entry.name)
                    folder_size = get_folder_size_recursive(subfolder_path)
                    subfolder_sizes[entry.name] = folder_size
                    print(f"Size of subfolder {entry.name}: {folder_size}")
    except OSError as e:
        print(f"Error calculating subfolder sizes for {folder_path}: {e}")
        return None

    return subfolder_sizes


def get_folder_size_recursive(folder_path):
    """Recursively calculate the size of a folder including its subfolders."""
    total_size = 0
    try:
        with os.scandir(folder_path) as entries:
            for entry in entries:
                item_path = os.path.join(folder_path, entry.name)
                if entry.is_file():
                    total_size += os.path.getsize(item_path)
                elif entry.is_dir():
                    total_size += get_folder_size_recursive(item_path)
    except OSError as e:
        print(f"Error calculating folder size for {folder_path}: {e}")
    return total_size

