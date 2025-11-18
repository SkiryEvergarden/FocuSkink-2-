import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet as RNStyleSheet,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native"
import { Calendar, LocaleConfig } from "react-native-calendars"
import { useTarefas } from "../contexts/TarefasContext"
import { useAppTheme } from "../contexts/ThemeContext"

const { height } = Dimensions.get("window")

LocaleConfig.locales["pt"] = {
  monthNames: ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],
  monthNamesShort: ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"],
  dayNames: ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"],
  dayNamesShort: ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"],
  today: "Hoje"
}
LocaleConfig.defaultLocale = "pt"

const startOfDay = (d) => {
  const x = new Date(d)
  x.setHours(0,0,0,0)
  return x
}
const today = () => startOfDay(new Date())
const parseDDMMYYYY = (s) => {
  const [dd,mm,yyyy] = (s||"").split("/").map(Number)
  if(!dd||!mm||!yyyy) return null
  const d = new Date(yyyy,mm-1,dd)
  if(d.getFullYear()!==yyyy||d.getMonth()!==mm-1||d.getDate()!==dd) return null
  return startOfDay(d)
}
const formatISO = (d) => {
  const y = d.getFullYear()
  const m = `${d.getMonth()+1}`.padStart(2,"0")
  const dd = `${d.getDate()}`.padStart(2,"0")
  return `${y}-${m}-${dd}`
}
const daysDiffFromToday = (d) => {
  const t0 = today().getTime()
  const t1 = startOfDay(d).getTime()
  return Math.floor((t1-t0)/(1000*60*60*24))
}
const sameDay = (a,b) => startOfDay(a).getTime() === startOfDay(b).getTime()
const getNext7Days = () => {
  const base = today()
  return Array.from({length:7},(_,i)=>{
    const d = new Date(base)
    d.setDate(base.getDate()+i)
    return d
  })
}

export default function Tela_Geren_Tarefas(){
  const navigation = useNavigation()
  const { colors } = useAppTheme()
  const { tarefas, addTarefa, concluirTarefa, excluirTarefa } = useTarefas()

  const tabs = ["Atrasadas","Diário","Semanal","Mensal","Concluídas"]
  const [selectedTab,setSelectedTab] = useState("Diário")

  const [weekDays,setWeekDays] = useState(getNext7Days())
  const [weekSelectedDate,setWeekSelectedDate] = useState(weekDays[0])

  const [monthSelectedISO,setMonthSelectedISO] = useState(formatISO(today()))

  const [modalVisible,setModalVisible] = useState(false)
  const modalOpacity = useRef(new Animated.Value(0)).current
  const modalTranslateY = useRef(new Animated.Value(50)).current

  const [detailVisible,setDetailVisible] = useState(false)
  const [selectedTask,setSelectedTask] = useState(null)

  const [confirmVisible,setConfirmVisible] = useState(false)
  const [deleteVisible,setDeleteVisible] = useState(false)

  const [loadingCreate,setLoadingCreate] = useState(false)
  const [loadingConcluir,setLoadingConcluir] = useState(false)
  const [loadingApagar,setLoadingApagar] = useState(false)

  const [titulo,setTitulo] = useState("")
  const [concluirAte,setConcluirAte] = useState("")
  const [descricao,setDescricao] = useState("")
  const [erroData,setErroData] = useState("")

  useEffect(()=>{
    const id = setInterval(()=>{
      const next = getNext7Days()
      setWeekDays(next)
      setWeekSelectedDate(next[0])
    },60*60*1000)
    return ()=>clearInterval(id)
  },[])

  function formatarData(texto){
    const numeros = texto.replace(/\D/g,"")
    let x = numeros
    if(numeros.length>2 && numeros.length<=4) x = `${numeros.slice(0,2)}/${numeros.slice(2)}`
    else if(numeros.length>4) x = `${numeros.slice(0,2)}/${numeros.slice(2,4)}/${numeros.slice(4,8)}`
    setConcluirAte(x)
    if(erroData) validarData(x)
  }

  function validarData(texto){
    if(!/^\d{2}\/\d{2}\/\d{4}$/.test(texto)){
      setErroData("Use o formato DD/MM/AAAA.")
      return false
    }
    const d = parseDDMMYYYY(texto)
    if(!d){
      setErroData("Data inválida.")
      return false
    }
    const hoje = today()
    const max = new Date(hoje)
    max.setFullYear(max.getFullYear()+3)
    if(d<hoje){
      setErroData("A data não pode estar no passado.")
      return false
    }
    if(d>max){
      setErroData("A data não pode ultrapassar 3 anos.")
      return false
    }
    setErroData("")
    return true
  }

  function openModal(){
    setModalVisible(true)
    Animated.parallel([
      Animated.timing(modalOpacity,{toValue:1,duration:260,useNativeDriver:true}),
      Animated.timing(modalTranslateY,{toValue:0,duration:260,useNativeDriver:true})
    ]).start()
  }

  function closeModal(){
    Animated.parallel([
      Animated.timing(modalOpacity,{toValue:0,duration:200,useNativeDriver:true}),
      Animated.timing(modalTranslateY,{toValue:50,duration:200,useNativeDriver:true})
    ]).start(()=>{
      setModalVisible(false)
      setTitulo("")
      setConcluirAte("")
      setDescricao("")
      setErroData("")
    })
  }

  async function handleCreateTask(){
    const okTitulo = titulo.trim().length>0
    const okData = validarData(concluirAte)
    if(!okTitulo||!okData||loadingCreate) return
    setLoadingCreate(true)
    await addTarefa({
      titulo:titulo.slice(0,100),
      concluirAte,
      descricao:descricao.slice(0,300)
    })
    setLoadingCreate(false)
    closeModal()
  }

  const basePorAba = useMemo(()=>{
    const now = today()
    if(selectedTab==="Concluídas") return tarefas.filter(t=>t.concluida)
    if(selectedTab==="Atrasadas") return tarefas.filter(t=>{
      if(t.concluida) return false
      const d = parseDDMMYYYY(t.concluirAte)
      return d && d<now
    })
    return tarefas.filter(t=>{
      if(t.concluida) return false
      const d = parseDDMMYYYY(t.concluirAte)
      if(!d||d<now) return false
      const diff = daysDiffFromToday(d)
      if(selectedTab==="Diário") return diff===0
      if(selectedTab==="Semanal") return diff>=0 && diff<=7
      if(selectedTab==="Mensal") return diff>=0
      return false
    })
  },[tarefas,selectedTab])

  const tarefasFiltradas = useMemo(()=>{
    if(["Diário","Concluídas","Atrasadas"].includes(selectedTab)) return basePorAba
    if(selectedTab==="Semanal") return basePorAba.filter(t=>{
      const d = parseDDMMYYYY(t.concluirAte)
      return d && sameDay(d,weekSelectedDate)
    })
    if(selectedTab==="Mensal"){
      const [y,m,d] = monthSelectedISO.split("-").map(Number)
      const sel = startOfDay(new Date(y,m-1,d))
      return basePorAba.filter(t=>{
        const dt = parseDDMMYYYY(t.concluirAte)
        return dt && sameDay(dt,sel)
      })
    }
    return basePorAba
  },[basePorAba,selectedTab,weekSelectedDate,monthSelectedISO])

  const calendarMarks = useMemo(()=>{
    const marks = {}
    tarefas.forEach(t=>{
      if(t.concluida) return
      const d = parseDDMMYYYY(t.concluirAte)
      if(!d) return
      if(d>=today()){
        const key = formatISO(d)
        marks[key] = {marked:true,dotColor:"#ff005c"}
      }
    })
    marks[monthSelectedISO] = {
      ...(marks[monthSelectedISO]||{}),
      selected:true,
      selectedColor:"#ff005c"
    }
    return marks
  },[tarefas,monthSelectedISO])

  const CardTarefa = ({item})=>(
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={()=>{
        setSelectedTask(item)
        setDetailVisible(true)
      }}
    >
      <View style={[
        styles.card,
        {backgroundColor:colors.card,borderColor:colors.border}
      ]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle,{color:colors.textPrimary}]} numberOfLines={1}>
            {item.titulo}
          </Text>
          <View style={[
            styles.badge,
            {backgroundColor:colors.input,borderColor:colors.border}
          ]}>
            <Text style={[styles.badgeText,{color:colors.textSecondary}]}>
              {(()=>{
                if(item.concluida) return "Concluída"
                const d = parseDDMMYYYY(item.concluirAte)
                if(!d) return ""
                if(d<today()) return "Atrasada"
                const diff = daysDiffFromToday(d)
                if(diff===0) return "Diária"
                if(diff>0&&diff<=7) return "Semanal"
                return "Mensal"
              })()}
            </Text>
          </View>
        </View>

        {!!item.descricao && (
          <Text style={[styles.cardDesc,{color:colors.textSecondary}]} numberOfLines={3}>
            {item.descricao}
          </Text>
        )}
        <Text style={[styles.cardDue,{color:colors.textMuted}]}>
          Até {item.concluirAte}
        </Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={[styles.container,{backgroundColor:colors.background}]}>

      <View style={styles.header}>
        <TouchableOpacity onPress={()=>navigation.goBack()}>
          <Image
            source={require("../assets_icons/arrow_icon.png")}
            style={[styles.backIcon,{tintColor:colors.icon}]}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={openModal} style={[styles.addFab,{backgroundColor:"#ff005c"}]}>
          <Ionicons name="add" size={26} color="#fff"/>
        </TouchableOpacity>
      </View>

      <View style={styles.fixedTabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {tabs.map(tab=>(
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabChip,
                {
                  backgroundColor: selectedTab===tab ? colors.input : colors.card,
                  borderColor: selectedTab===tab ? "#ff005c" : colors.border
                }
              ]}
              onPress={()=>setSelectedTab(tab)}
              activeOpacity={0.85}
            >
              <Text style={[
                styles.tabText,
                {color: selectedTab===tab ? "#ff005c" : colors.textSecondary}
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {selectedTab==="Semanal" && (
        <View style={styles.weekRow}>
          {weekDays.map((d,i)=>{
            const isSelected = sameDay(d,weekSelectedDate)
            const weekday = d.toLocaleDateString("pt-BR",{weekday:"short"}).replace(".","")
            return (
              <TouchableOpacity key={i} style={styles.dayWrapper} onPress={()=>setWeekSelectedDate(d)} activeOpacity={0.9}>
                <Text style={[styles.dayLabel,{color:colors.textMuted}]}>{weekday}</Text>

                <View style={[
                  styles.dayBox,
                  {backgroundColor:colors.card,borderColor:colors.border},
                  isSelected && {backgroundColor:"#ff005c",borderColor:"#ff005c"}
                ]}>
                  <Text style={[
                    styles.dayText,
                    {color: isSelected ? "#fff" : colors.textPrimary}
                  ]}>
                    {`${d.getDate()}`.padStart(2,"0")}
                  </Text>
                </View>

                {isSelected && <View style={styles.selectedLine}/>}
              </TouchableOpacity>
            )
          })}
        </View>
      )}

      {selectedTab==="Mensal" && (
        <View style={[
          styles.calendarCard,
          {backgroundColor:colors.card,borderColor:colors.border}
        ]}>
          <Calendar
            monthFormat={"MMMM yyyy"}
            onDayPress={(day)=>setMonthSelectedISO(day.dateString)}
            markedDates={calendarMarks}
            hideExtraDays={false}
            enableSwipeMonths
            theme={{
              backgroundColor:colors.card,
              calendarBackground:colors.card,
              dayTextColor:colors.textPrimary,
              monthTextColor:colors.textPrimary,
              textDisabledColor:colors.textMuted,
              arrowColor:"#ff005c",
              todayTextColor:"#ff005c",
              textSectionTitleColor:colors.textMuted,
              selectedDayBackgroundColor:"#ff005c",
              selectedDayTextColor:"#ffffff"
            }}
          />
        </View>
      )}

      <FlatList
        data={tarefasFiltradas}
        keyExtractor={(i)=>i.id}
        renderItem={({item})=><CardTarefa item={item}/>}
        ListEmptyComponent={
          <View style={[
            styles.emptyBox,
            {backgroundColor:colors.card,borderColor:colors.border}
          ]}>
            <Text style={[styles.emptyText,{color:colors.textMuted}]}>
              Nenhuma tarefa para este período.
            </Text>
          </View>
        }
        contentContainerStyle={{paddingHorizontal:16,paddingBottom:110}}
        showsVerticalScrollIndicator={false}
      />

      {modalVisible && (
        <Animated.View style={[styles.modalOverlay,{opacity:modalOpacity}]}>
          <BlurView intensity={30} tint="dark" style={RNStyleSheet.absoluteFill}/>
          <TouchableWithoutFeedback onPress={closeModal}>
            <View style={RNStyleSheet.absoluteFill}/>
          </TouchableWithoutFeedback>

          <KeyboardAvoidingView
            behavior={Platform.OS==="ios"?"padding":"height"}
            style={[styles.modalWrapper,{justifyContent:"flex-end"}]}
            keyboardVerticalOffset={20}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <Animated.ScrollView
                contentContainerStyle={[
                  styles.modalContent,
                  {
                    transform:[{translateY:modalTranslateY}],
                    backgroundColor:colors.card,
                    borderColor:colors.border,
                    marginBottom:height*0.12
                  }
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={closeModal}>
                    <Image
                      source={require("../assets_icons/arrow_icon.png")}
                      style={[styles.backIcon,{tintColor:colors.icon}]}
                    />
                  </TouchableOpacity>

                  <Text style={[styles.modalTitle,{color:colors.textPrimary}]}>
                    Criar nova tarefa
                  </Text>
                </View>

                <TextInput
                  placeholder="Título (até 100)"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.input,
                    {backgroundColor:colors.input,borderColor:colors.border,color:colors.textPrimary}
                  ]}
                  value={titulo}
                  onChangeText={(t)=>setTitulo(t.slice(0,100))}
                />
                <Text style={[styles.counter,{color:colors.textMuted}]}>
                  {titulo.length}/100
                </Text>

                <TextInput
                  placeholder="Data (DD/MM/AAAA)"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  style={[
                    styles.input,
                    erroData ? {borderColor:"#ff3b3b"} : {},
                    {backgroundColor:colors.input,borderColor:colors.border,color:colors.textPrimary}
                  ]}
                  value={concluirAte}
                  onChangeText={formatarData}
                  onBlur={()=>concluirAte && validarData(concluirAte)}
                  maxLength={10}
                />
                {!!erroData && (
                  <Text style={[styles.errorText,{color:"#ff3b3b"}]}>
                    {erroData}
                  </Text>
                )}

                <TextInput
                  placeholder="Descrição (até 300)"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={4}
                  style={[
                    styles.input,
                    styles.textArea,
                    {backgroundColor:colors.input,borderColor:colors.border,color:colors.textPrimary}
                  ]}
                  value={descricao}
                  onChangeText={(t)=>setDescricao(t.slice(0,300))}
                />
                <Text style={[styles.counter,{color:colors.textMuted}]}>
                  {descricao.length}/300
                </Text>

                <TouchableOpacity
                  style={[
                    styles.createButton,
                    loadingCreate && {opacity:0.5}
                  ]}
                  disabled={loadingCreate}
                  onPress={handleCreateTask}
                >
                  <LinearGradient
                    colors={["#ff2b6b","#ff005c"]}
                    start={{x:0,y:0}}
                    end={{x:1,y:0}}
                    style={styles.createButtonInner}
                  >
                    <Text style={styles.createButtonText}>
                      {loadingCreate ? "Criando..." : "Criar tarefa"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

              </Animated.ScrollView>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Animated.View>
      )}

      {detailVisible && selectedTask && (
        <View style={styles.detailOverlay}>
          <BlurView intensity={30} tint="dark" style={RNStyleSheet.absoluteFill}/>
          <TouchableWithoutFeedback onPress={()=>setDetailVisible(false)}>
            <View style={RNStyleSheet.absoluteFill}/>
          </TouchableWithoutFeedback>

          <View style={[
            styles.detailBox,
            {backgroundColor:colors.card,borderColor:colors.border}
          ]}>
            {!selectedTask.concluida ? (
              <View style={{flexDirection:"row",alignItems:"center",marginBottom:10}}>
                <TouchableOpacity
                  onPress={()=>setDetailVisible(false)}
                  style={[
                    styles.arrowBtn,
                    {backgroundColor:colors.input,borderColor:colors.border}
                  ]}
                >
                  <Ionicons name="chevron-back" size={20} color="#ff005c"/>
                </TouchableOpacity>
                <Text style={[styles.detailTitle,{color:colors.textPrimary}]} numberOfLines={1}>
                  {selectedTask.titulo}
                </Text>
              </View>
            ) : (
              <Text style={[styles.detailTitle,{color:colors.textPrimary}]}>
                {selectedTask.titulo}
              </Text>
            )}

            {!!selectedTask.descricao && (
              <Text style={[styles.detailDesc,{color:colors.textSecondary}]}>
                {selectedTask.descricao}
              </Text>
            )}
            <Text style={[styles.detailDate,{color:colors.textMuted}]}>
              Até {selectedTask.concluirAte}
            </Text>

            {selectedTab!=="Concluídas" && !selectedTask.concluida && (
              <>
                <TouchableOpacity
                  style={[
                    styles.detailButton,
                    {backgroundColor:"#ff005c"},
                    loadingConcluir && {opacity:0.5}
                  ]}
                  disabled={loadingConcluir}
                  onPress={async()=>{
                    if(loadingConcluir) return
                    setLoadingConcluir(true)
                    await concluirTarefa(selectedTask.id)
                    setLoadingConcluir(false)
                    setDetailVisible(false)
                  }}
                >
                  <Text style={styles.detailButtonTextPrimary}>
                    {loadingConcluir ? "Concluindo..." : "Concluir"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.detailButton,
                    {backgroundColor:colors.input},
                    loadingApagar && {opacity:0.5}
                  ]}
                  disabled={loadingApagar}
                  onPress={async()=>{
                    setLoadingApagar(true)
                    setDeleteVisible(true)
                  }}
                >
                  <Text style={[
                    styles.detailButtonTextSecondary,
                    {color:colors.textPrimary}
                  ]}>
                    {loadingApagar ? "Apagando..." : "Apagar"}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {selectedTask.concluida && (
              <TouchableOpacity onPress={()=>setDetailVisible(false)}>
                <Text style={[styles.detailClose,{color:"#ff005c"}]}>Fechar</Text>
              </TouchableOpacity>
            )}

          </View>
        </View>
      )}

      {confirmVisible && (
        <View style={styles.confirmOverlay}>
          <BlurView intensity={30} tint="dark" style={styles.confirmBlur}/>
          <TouchableWithoutFeedback onPress={()=>setConfirmVisible(false)}>
            <View style={RNStyleSheet.absoluteFill}/>
          </TouchableWithoutFeedback>

          <View style={[
            styles.confirmBox,
            {backgroundColor:colors.card,borderColor:colors.border}
          ]}>
            <Text style={[styles.confirmTitle,{color:colors.textPrimary}]}>
              Você deseja concluir a tarefa?
            </Text>
            <Text style={[styles.confirmText,{color:colors.textSecondary}]}>
              Essa confirmação ajuda a manter seu progresso atualizado e os relatórios mais precisos.
            </Text>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                {backgroundColor:"#ff005c"},
                loadingConcluir && {opacity:0.5}
              ]}
              disabled={loadingConcluir}
              onPress={async()=>{
                setLoadingConcluir(true)
                if(selectedTask) await concluirTarefa(selectedTask.id)
                setLoadingConcluir(false)
                setConfirmVisible(false)
                setDetailVisible(false)
              }}
            >
              <Text style={styles.confirmButtonTextPrimary}>
                {loadingConcluir ? "Concluindo..." : "Sim, desejo concluir"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                {backgroundColor:colors.input}
              ]}
              onPress={()=>setConfirmVisible(false)}
            >
              <Text style={[
                styles.confirmButtonTextSecondary,
                {color:colors.textPrimary}
              ]}>
                Não desejo concluir
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      )}

      {deleteVisible && (
        <View style={styles.confirmOverlay}>
          <BlurView intensity={30} tint="dark" style={styles.confirmBlur}/>
          <TouchableWithoutFeedback onPress={()=>setDeleteVisible(false)}>
            <View style={RNStyleSheet.absoluteFill}/>
          </TouchableWithoutFeedback>

          <View style={[
            styles.confirmBox,
            {backgroundColor:colors.card,borderColor:colors.border}
          ]}>
            <Text style={[styles.confirmTitle,{color:colors.textPrimary}]}>
              Deseja apagar a tarefa?
            </Text>
            <Text style={[styles.confirmText,{color:colors.textSecondary}]}>
              Essa ação é permanente e removerá a tarefa da sua lista.
            </Text>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                {backgroundColor:"#ff005c"},
                loadingApagar && {opacity:0.5}
              ]}
              disabled={loadingApagar}
              onPress={async()=>{
                if(selectedTask) await excluirTarefa(selectedTask.id)
                setLoadingApagar(false)
                setDeleteVisible(false)
                setDetailVisible(false)
              }}
            >
              <Text style={styles.confirmButtonTextPrimary}>
                {loadingApagar ? "Apagando..." : "Sim, desejo apagar"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                {backgroundColor:colors.input}
              ]}
              onPress={()=>{
                setLoadingApagar(false)
                setDeleteVisible(false)
              }}
            >
              <Text style={[
                styles.confirmButtonTextSecondary,
                {color:colors.textPrimary}
              ]}>
                Não desejo apagar
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      )}

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 6
  },

  backIcon: {
    width: 36,
    height: 36
  },

  addFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center"
  },

  fixedTabs: {
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6
  },

  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16
  },

  tabChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  tabText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    textAlignVertical: "center",
    textAlign: "center"
  },

  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 12,
    marginTop: 6,
    marginBottom: 4
  },

  dayWrapper: {
    alignItems: "center",
    flex: 1
  },

  dayLabel: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    marginBottom: 4,
    textTransform: "capitalize"
  },

  dayBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  dayText: {
    fontSize: 15,
    fontFamily: "Poppins_700Bold"
  },

  selectedLine: {
    width: 28,
    height: 3,
    backgroundColor: "#ff005c",
    borderRadius: 2,
    marginTop: 4
  },

  calendarCard: {
    borderRadius: 16,
    padding: 10,
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 6,
    borderWidth: 1
  },

  emptyBox: {
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 10,
    borderWidth: 1
  },

  emptyText: {
    fontFamily: "Poppins_400Regular"
  },

  card: {
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    marginHorizontal: 16,
    borderWidth: 1
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },

  cardTitle: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    maxWidth: "70%"
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1
  },

  badgeText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular"
  },

  cardDesc: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    marginTop: 10
  },

  cardDue: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    marginTop: 8
  },

  modalOverlay: {
    ...RNStyleSheet.absoluteFillObject,
    justifyContent: "flex-end"
  },

  modalWrapper: {
    width: "100%",
    justifyContent: "flex-end"
  },

  modalContent: {
    width: "100%",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    minHeight: height * 0.75,
    borderTopWidth: 1
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },

  modalTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    marginLeft: 10
  },

  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: "Poppins_400Regular",
    marginBottom: 6,
    borderWidth: 1
  },

  textArea: {
    height: 110,
    textAlignVertical: "top"
  },

  counter: {
    alignSelf: "flex-end",
    fontSize: 12,
    marginBottom: 8
  },

  errorText: {
    fontSize: 13,
    marginBottom: 6
  },

  createButton: {
    marginTop: 10,
    alignSelf: "stretch"
  },

  createButtonInner: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },

  createButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "Poppins_700Bold"
  },

  detailOverlay: {
    ...RNStyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center"
  },

  detailBox: {
    padding: 24,
    borderRadius: 14,
    width: "85%",
    borderWidth: 1
  },

  arrowBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderWidth: 1
  },

  detailTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    flexShrink: 1
  },

  detailDesc: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    marginBottom: 10
  },

  detailDate: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    marginBottom: 18
  },

  detailButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 8
  },

  detailButtonTextPrimary: {
    color: "#ffffff",
    fontFamily: "Poppins_700Bold"
  },

  detailButtonTextSecondary: {
    fontFamily: "Poppins_700Bold"
  },

  detailClose: {
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
    marginTop: 10
  },

  confirmOverlay: {
    ...RNStyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center"
  },

  confirmBlur: {
    ...RNStyleSheet.absoluteFillObject
  },

  confirmBox: {
    borderRadius: 20,
    padding: 24,
    width: "85%",
    borderWidth: 1
  },

  confirmTitle: {
    fontSize: 17,
    fontFamily: "Poppins_700Bold",
    marginBottom: 6
  },

  confirmText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    marginBottom: 18
  },

  confirmButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 8
  },

  confirmButtonTextPrimary: {
    color: "#ffffff",
    fontSize: 14,
    fontFamily: "Poppins_700Bold"
  },

  confirmButtonTextSecondary: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold"
  }
})
