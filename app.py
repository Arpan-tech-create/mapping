from flask import Flask, jsonify, render_template,request
import df

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/master_data')
def data():
    network_drives = df.get_network_drives()
    print("Mapped network drives:", network_drives)
    drive_data = []

    for pool, paths in df.pools.items():
        master_path = paths['master']
        drive_letter = next((drive[0] for drive in network_drives if drive[1] == master_path), None)
        if drive_letter:
            total_space, free_space = df.get_drive_space_info(drive_letter)
            if total_space is not None and free_space is not None:
                occupied_space = total_space - free_space
                drive_data.append({
                    'category': pool,
                    'total_capacity': total_space,
                    'free_space': free_space,
                    'occupied_space': round(occupied_space, 2),
                    'network_path':master_path
                })
        print("drive_data",drive_data)
    return jsonify(drive_data)


@app.route('/slave_data',methods=['GET'])
def slave_data():
    category = request.args.get('category')
    paths = df.pools.get(category)
    print("net paths",paths)
    if not paths:
        return jsonify([])

    slave_path = paths['slave']
    network_drives = df.get_network_drives()
    drive_letter = next((drive[0] for drive in network_drives if drive[1] == slave_path), None)
    drive_data = []

    if drive_letter:
        total_space, free_space = df.get_drive_space_info(drive_letter)
        if total_space is not None and free_space is not None:
            occupied_space = total_space - free_space
            drive_data.append({
                'category': category,
                'total_capacity': total_space,
                'free_space': free_space,
                'occupied_space': round(occupied_space, 2),
                'network_path': slave_path
            })
        print("slaves",drive_data)
    return jsonify(drive_data)


@app.route('/get_shards_for_master')
def shards_data():
    pool_name = request.args.get('pool_name')

    shards = df.get_shards_by_pool(pool_name)
    return jsonify(shards)
@app.route('/get_shards_for_slaves')
def shards_data2():
    pool_name = request.args.get('pool_name')

    shards = df.get_shards_by_pool(pool_name)
    return jsonify(shards)


@app.route("/get_years_by_shards")
def get_year():

    folder_path=request.args.get('folder_path')

    years=df.append_subfolder_sizes(folder_path)

    return jsonify(years)
if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0')
