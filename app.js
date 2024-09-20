new Vue({
  el: '#app',
  delimiters: ["${", "}"],
  data() {
    return {
      masterChartOptions: {
        chart: {
          type: 'column',
          renderTo: 'masterContainer'
        },
        title: {
          text: 'Masters'
        },
        xAxis: {
          categories: []
        },
        yAxis: {
          min: 0,
          title: {
            text: 'Space (GB)'
          },
          labels: {
            formatter: function() {
              return this.value + ' GB';
            }
          },
          stackLabels: {
            enabled: false
          }
        },
        credits: {
          enabled: false
        },
        plotOptions: {
          column: {
            stacking: 'normal',
            dataLabels: {
              enabled: true,
              rotation: 0,
              inside: true,
              verticalAlign: 'middle',
              y: 0,
              style: {
                fontWeight: 'bold',
                fontSize: '14px'
              }
            },
            events: {
              click: (event) => {
                const category = event.point.category;
                console.log("cat",category)
                this.fetchSlaveData(category);
                const driveType = event.point.series.name.includes('Master') ? 'master' : 'slave';
                console.log("Category:", category, "Drive Type:", driveType);
                this.fetchShardData(category);

                
              }
            }
          }
        },
        series: [
          { name: 'Free Space', data: [] },
          { name: 'Occupied Space', data: [] },
          { name: 'Total Capacity', data: [] }
        ]
      },
      slaveChartOptions: {
        chart: {
          type: 'column',
          renderTo: 'slaveContainer'
        },
        title: {
          text: 'Slaves'
        },
        xAxis: {
          categories: []
        },
        yAxis: {
          min: 0,
          title: {
            text: 'Space (GB)'
          },
          labels: {
            formatter: function() {
              return this.value + ' GB';
            }
          },
          stackLabels: {
            enabled: false
          }
        },
        credits: {
          enabled: false
        },
        plotOptions: {
          column: {
            stacking: 'normal',
            dataLabels: {
              enabled: true,
              rotation: 0,
              inside: true,
              verticalAlign: 'middle',
              y: 0,
              style: {
                fontWeight: 'bold',
                fontSize: '14px'
              }
            },
            events: {
              click: (event) => {
                const category = event.point.category;
                console.log("cat",category)
                this.fetchSlaveData(category);
      
                this.fetchShardDataforslave(category);
              }
            }
          }
        },
        series: [
          { name: 'Free Space', data: [] },
          { name: 'Occupied Space', data: [] },
          { name: 'Total Capacity', data: [] }
        ]
      },
      shardChartOptions: {
        chart: {
          type: 'column',
          renderTo: 'shardContainer'
        },
        title: {
          text: 'Shards'
        },
        xAxis: {
          categories: [],
        
        },
        yAxis: {
          min: 0,
          title: {
            text: 'Space Occupy'
          },
          labels: {
            formatter: function() {
              return this.value + ' Bytes';
            },
           
          },
          stackLabels: {
            enabled: false
          }
        },
        credits: {
          enabled: false
        },
        plotOptions: {
          column: {
            
        
            dataLabels: {
              enabled: true,
              rotation: 0,
             inside:true,
              verticalAlign: 'top',
              y: 0,
              style: {
                fontWeight: 'bold',
                fontSize: '12px'
              }
            },
            events: {
              click: (event) => {
                const category = event.point.category;
                console.log("cat",category)
            
                this.fetchYearDataforShards(category);
              }
            }
          }
        },
        series: [
     
          { name: 'Occupied Space', data: [] }
        
        ]
      },
      yearchartoption: {
        chart: {
          type: 'column',
          renderTo: 'yearContainer'
        },
        title: {
          text: 'Years'
        },
        xAxis: {
          categories: [],
        
        },
        yAxis: {
          min: 0,
          title: {
            text: 'Space Occupy'
          },
          labels: {
            formatter: function() {
              return this.value + ' Bytes';
            },
           
          },
          stackLabels: {
            enabled: false
          }
        },
        credits: {
          enabled: false
        },
        plotOptions: {
          bar: {
            stacking: 'normal',
            dataLabels: {
              enabled: true,
              rotation: 0,
             inside:false,
              verticalAlign: 'top',
              y: -5,
              style: {
                fontWeight: 'bold',
                fontSize: '14px'
              }
            }
          }
        },
        series: [
          { name: 'Free Space', data: [] },
          { name: 'Occupied Space', data: [] },
          { name: 'Total Capacity', data: [] }
        ]
      },
      showSlaveChart:false,
      showShardsChart:false,
      showShardsChart2:false,
      shardscount:0,
      showshardscount_for_master:false,
      showshardscount_for_slave:false,

      showyearschartformaster:false
    }

    
   
  },
  mounted() {
    this.fetchPoolData();
  },
  methods: {
    fetchPoolData() {
      this.showSlaveChart = false;
      fetch('/master_data')
        .then(response => response.json())
        .then(data => {
          console.log("master_data",data);
          const categories = data.map(item => item.category);
          const freeSpaceData = data.map(item => item.free_space);
          const occupiedSpaceData = data.map(item => item.occupied_space);
          const totalCapacityData = data.map(item => item.total_capacity);

          this.masterChartOptions.xAxis.categories = categories;
          this.masterChartOptions.series[0].data = freeSpaceData;
          this.masterChartOptions.series[1].data = occupiedSpaceData;
          this.masterChartOptions.series[2].data = totalCapacityData;

          Highcharts.chart(this.masterChartOptions);
      
        })
        .catch(error => console.error('Error fetching data:', error));
    },
    fetchSlaveData(category) {
      this.showSlaveChart = true;
      fetch(`/slave_data?category=${category}`)
        .then(response => response.json())
        .then(data => {
          console.log(data);
       
          const categories = data.map(item => item.category);
          const freeSpaceData = data.map(item => item.free_space);
          const occupiedSpaceData = data.map(item => item.occupied_space);
          const totalCapacityData = data.map(item => item.total_capacity);

          this.slaveChartOptions.xAxis.categories = categories;
          this.slaveChartOptions.series[0].data = freeSpaceData;
          this.slaveChartOptions.series[1].data = occupiedSpaceData;
          this.slaveChartOptions.series[2].data = totalCapacityData;
          this.slaveChartOptions.title.text = `Slave  for ${category}`;
          Highcharts.chart(this.slaveChartOptions);
   
        })
        .catch(error => console.error('Error fetching data:', error));
    },

    fetchShardData(pool_name) {
      this.showShardsChart = true;
      this.showshardscount_for_master=true;
      fetch(`/get_shards_for_master?pool_name=${pool_name}`)
        .then(response => response.json())
        .then(data => {
          console.log("shards", data);
          const driver_type_data = data.filter(item => item.type === 'master');
          console.log("driver", driver_type_data);

          this.shardscount=driver_type_data.length
          console.log("this",this.shardscount)
    
   
          this.shardChartOptions.title.text = `Shards for ${pool_name} (Master)`;
          this.shardChartOptions.xAxis.categories = driver_type_data.map(item => item.folder);
          this.shardChartOptions.series = [
            {
              name: 'Occupied Space',
              data: driver_type_data.map(item => item.outer_folder_size),
              showInLegend: true
            }
            
          ];


          // this.shardChartOptions.series[0].data = data.map(item => item.free_space);
       
          // this.shardChartOptions.series[2].data = data.map(item => item.total_capacity);
          Highcharts.chart(this.shardChartOptions);
        });
    },

    fetchShardDataforslave(pool_name) {
      this.showShardsChart2 = true;
      this.showshardscount_for_slave=true;
      fetch(`/get_shards_for_slaves?pool_name=${pool_name}`)
        .then(response => response.json())
        .then(data => {
          console.log("shardsslave", data);
          const driver_type_data = data.filter(item => item.type === 'slave');
          console.log("driver", driver_type_data);

          this.shardscount=driver_type_data.length
          console.log("this",this.shardscount)
          

          this.shardChartOptions.title.text = `Shards for ${pool_name} (Slave)`;
          this.shardChartOptions.xAxis.categories = driver_type_data.map(item => item.folder);
          this.shardChartOptions.series = [
            {
              name: 'Occupied Space',
              data: driver_type_data.map(item => item.outer_folder_size),
              showInLegend: true
            }
            
          ];


          //this.shardChartOptions.series[0].data = driver_type_data.map(item => item.free_space);
       
          //this.shardChartOptions.series[2].data = driver_type_data.map(item => item.total_capacity);
          Highcharts.chart(this.shardChartOptions);
        });
    },
    

    fetchYearDataforShards(folder_path) {
      this.showyearschartformaster= true;
   
      fetch(`/get_years_by_shards?folder_path=${folder_path}`)
        .then(response => response.json())
        .then(data => {
      

       
          

          this.yearchartoption.title.text = `Shards for ${folder_path} (Slave)`;
         // this.yearchartoption.xAxis.categories = data.map(item => item.year);
          this.yearchartoption.series[1].data = data.map(item => item.outer_folder_size);


          //this.shardChartOptions.series[0].data = driver_type_data.map(item => item.free_space);
       
          //this.shardChartOptions.series[2].data = driver_type_data.map(item => item.total_capacity);
          Highcharts.chart(this.yearchartoption);
        });
    }
  }
});
