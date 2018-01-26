const total = {}

function getAdsenseReport() {
    if($('#cal1').val().length !== 0 && $('#cal2').val().length !== 0) {
        const date1 = $('#cal1').val().replace(/\//g,'-');
        const date2 = $('#cal2').val().replace(/\//g,'-');

        $.ajax({
            url: '/adsense', 
            method: 'POST', 
            data:{ date1: date1, date2: date2 }
        }).done((results) => {
            let data = JSON.parse(results);
            console.log(data);
            $("#result").html(`
                <a href="report.xlsx">Download</a>                
                <table style="width:100%">
                    <tr>
                        <th>date</th>
                        <th>表示回数</th> 
                        <th>クリック率</th> 
                        <th>CPC</th>
                        <th>インプレッション収益</th>
                        <th>収益</th>
                    </tr>
                    ${data.map(e => {
                        return `
                            <tr>
                                <td><b>${e[0].split('-')[0]}</b>年<b>${e[0].split('-')[1]}</b>月</td>
                                <td>${e[1]}</td>
                                <td>${e[2]}%</td>
                                <td>¥${e[3]}</td>
                                <td>¥${e[4]}</td>
                                <td></td>
                            </tr>
                        `
                    }).join('')}
                </table>
            `)
        })
    }
    return false;
}

$( ".datepicker" ).datepicker( $.datepicker.regional[ "ja" ]);

$("#submit").click(getAdsenseReport);