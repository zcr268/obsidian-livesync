async function main() {
  function test(bool?: boolean) {
    console.log(`${bool}:undefined:${bool == undefined}`)
    console.log(`${bool}:false:${bool == false}`)
    console.log(`${bool}:true:${bool == true}`)
  }

  test(true)
  test(false)
  test()
}

main().catch(console.log)